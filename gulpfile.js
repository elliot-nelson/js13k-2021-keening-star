// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
const AsepriteCli       = require('aseprite-cli');
const chalk             = require('chalk');
const { execSync }      = require('child_process');
const fs                = require('fs');
const gulp              = require('gulp');
const log               = require('fancy-log');
const p8tojs            = require('p8-to-js');
const rollup            = require('rollup');
const rollupNodeResolve = require('@rollup/plugin-node-resolve');

const FontExporter      = require('./tools/font-exporter');
const WorldBuilder      = require('./tools/world-builder');

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------
const advzip            = require('gulp-advzip');
const concat            = require('gulp-concat');
const cleancss          = require('gulp-clean-css');
const htmlmin           = require('gulp-htmlmin');
const size              = require('gulp-size');
const sourcemaps        = require('gulp-sourcemaps');
const template          = require('gulp-template');
const terser            = require('gulp-terser');
const zip               = require('gulp-zip');

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
let watching = false;

// -----------------------------------------------------------------------------
// Assets Build
// -----------------------------------------------------------------------------
async function exportFont() {
    // Normally, I would export all frames of all Aseprite files into a big spritesheet,
    // with no concern where the frames end up -- we'd use the JSON output to determine
    // the new coordinates of all images.
    //
    // The font is a special case because it is also the source file for our TSX (tileset)
    // file in Tiled, so that we can see the in-game characters while editing the map.
    // So we will export this one to its own dedicated output file.

    const src = 'src/assets/font-bizcat-knife.aseprite';
    const png = 'src/assets/font-gen.png';
    const output = 'src/js/Font-gen.js';

    try {
        await AsepriteCli.exec([
            '--tag', 'font',
            src,
            '--sheet', png
        ]);
    } catch (e) {
        // Allow developers without Aseprite to build the project (if desired, they'll need
        // to update the generated image files manually).
        log.error(e);
        log.warn(chalk.red(`Failed to update ${png}, but continuing anyway...`));
    }

    await FontExporter.export(png, output);
}

async function crushFont() {
    execSync('pngout src/assets/font-gen.png', { stdio: 'inherit' });
}

async function generateWorld() {
    const mapFile = 'src/assets/world.tmx';
    const detailFile = 'src/assets/world.yaml';
    const worldFile = 'src/js/WorldData-gen.js';
    const jsonFile = 'src/assets/WorldData-gen.json';

    await WorldBuilder.build(mapFile, detailFile, worldFile, jsonFile);
}

async function generateAudio() {
    const p8File = 'src/assets/audio.p8';
    const jsFile = 'src/js/AudioData-gen.js';

    await p8tojs.convertFile(p8File, jsFile, {
        export: 'AudioData',
        sections: ['sfx', 'music'],
        encoding: 'hex'
    });
}

const buildAssets = gulp.series(
    exportFont,
    crushFont,
    generateWorld,
    generateAudio
);

// -----------------------------------------------------------------------------
// JavaScript Build
// -----------------------------------------------------------------------------
async function compileBuild() {
    try {
        const bundle = await rollup.rollup({
            input: 'src/js/index.js',
            plugins: [rollupNodeResolve.nodeResolve()],

            // Hack... yes, my game has circular dependencies everywhere :). These
            // really aren't a problem as long as structures don't initialize themselves
            // on load (this is why most structures are inert until you execute `init()`
            // on them).
            //
            // Here we intentionally suppress any warnings related to circular dependency.
            onwarn: (warning, rollupWarn) => {
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    rollupWarn(warning);
                }
            }
        });

        await bundle.write({
            file: 'temp/bundled/app.js',
            format: 'iife',
            name: 'app',
            sourcemap: true,
            sourcemapFile: 'temp/bundled/app.js.map'
        });
    } catch (error) {
        // We are calling rollup's API directly instead of using the CLI, and the output is
        // not nearly as good. This hack imports and calls the same error handler that
        // the CLI uses, so we get the nice context in code showing us the issue.
        require('rollup/dist/shared/loadConfigFile').handleError(error, true);
        throw error;
    }
}

function minifyBuild() {
    // Before we begin mangling, we can pre-populate the name cache with a
    // customized list of names that can't be mangled (because names like RSTUDY
    // will be both keys and name strings throughout the code, we need them
    // to match).
    const world = JSON.parse(fs.readFileSync('src/assets/WorldData-gen.json'));
    const names = world.floors.reduce((list, floor) =>
        list.concat(floor.rooms.map(room => room.name)).concat(floor.objects.map(object => object.name)),
        []
    );

    const cache = {
        props: {
            props: Object.fromEntries(names.map(name => [`$${name}`, name]))
        }
    };

    // We use an extremely aggressive mangle -- all top-level names and all properties
    // of all objects -- basically every property we can find unless it's in the
    // list of exclusions above.
    return gulp.src('temp/bundled/app.js')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(terser({
        toplevel: true,
        nameCache: cache,
        mangle: {
            properties: {
                reserved: [
                    // Additional properties to exclude from mangling
                    'ArrowUp',
                    'ArrowLeft',
                    'ArrowDown',
                    'ArrowRight',
                    'KeyC',
                    'KeyL',
                    'KeyH',
                    'Escape'
                ]
            }
        }
    }))
    /*.pipe(terser({
        nameCache: cache,
        mangle: {
            properties: {
                builtins: true,
                regex: /^(behavior|direction|frame|reset|update|anchor|DEAD|canvas|entities|history|pressed|page|paused|resize|reload|pages|pattern|pause|unpause|sheet|state|init|play|text)$/
            }
        }
    }))*/
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('temp/minified'));
}

const buildJs = gulp.series(
    compileBuild,
    minifyBuild
);

// -----------------------------------------------------------------------------
// CSS Build
// -----------------------------------------------------------------------------
function buildCss() {
    return gulp.src('src/css/*.css')
        .pipe(concat('app.css'))
        .pipe(cleancss())
        .pipe(gulp.dest('temp'));
}

// -----------------------------------------------------------------------------
// HTML Build
// -----------------------------------------------------------------------------
function buildHtml() {
    const cssContent = fs.readFileSync('temp/app.css');
    const jsContent = fs.readFileSync('temp/minified/app.js');

    // Rather than having separate `app.css` and `app.js` files, we embed them both
    // inside the HTML file (and any sprites we want have already been embedded
    // inside `app.js`).
    //
    // Reducing the total number of files in the ZIP is a key strategy, since the
    // ZIP file format has an overhead of +/-100 bytes for EVERY FILE. Embedding
    // the CSS, JS, and PNG inside the HTML can save you almost 250 bytes, even
    // with the conversion from binary to base64!
    return gulp.src('src/index.html')
        .pipe(template({ css: cssContent, js: jsContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.src('temp/minified/app.js.map'))
        .pipe(gulp.dest('dist'));
}

// -----------------------------------------------------------------------------
// ZIP Build
// -----------------------------------------------------------------------------
function buildZip() {
    let sizeResult;

    return gulp.src(['dist/index.html'])
        .pipe(size())
        .pipe(zip('js13k-2020-wizard-with-a-shotgun.zip'))
        .pipe(advzip({ optimizationLevel: 4 /*, iterations: 200 */ }))
        .pipe(sizeResult = size({ title: 'zip' }))
        .pipe(gulp.dest('dist/final'))
        .on('end', () => {
            let remaining = (13 * 1024) - sizeResult.size;
            if (remaining < 0) {
                log.warn(chalk.red(`${-remaining} bytes over`));
            } else {
                log.info(chalk.green(`${remaining} bytes remaining`));
            }
        });
}

// -----------------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------------
const build = gulp.series(
    buildAssets,
    buildCss,
    buildJs,
    buildHtml,
    ready
);

async function ready() {
    if (!watching) return;

    // This function doesn't affect the build at all, it's something I use as the
    // build gets longer and slower in watch mode -- it flashes and dings the terminal
    // when it's safe to refresh my browser.
    const BELL = '\u0007';
    const REVERSE = '\x1B[?5h';
    const NORMAL = '\x1B[?5l';

    process.stdout.write(`${BELL}${REVERSE}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    process.stdout.write(`${NORMAL}\n`);
}

// -----------------------------------------------------------------------------
// Watch
// -----------------------------------------------------------------------------
function watch() {
    watching = true;

    // All files generated by the build are suffixed with "-gen", so we make
    // sure to ignore those when watching for changed files.
    gulp.watch(['src/**', '!src/**/*-gen*'], build);
}

// -----------------------------------------------------------------------------
// Task List
// -----------------------------------------------------------------------------
module.exports = {
    // Core build steps
    buildAssets,
    buildCss,
    buildJs,
    buildHtml,
    buildZip,

    // Primary entry points
    build,
    watch,

    default: gulp.series(build, watch)
};
