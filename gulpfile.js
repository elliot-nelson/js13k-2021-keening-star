// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
const AsepriteCli       = require('aseprite-cli');
const chalk             = require('chalk');
const fs                = require('fs');
const gulp              = require('gulp');
const rollup            = require('rollup');

const ImageDataParser   = require('./tools/image-data-parser.js');
const WorldBuilder      = require('./tools/world-builder.js');

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------
const concat            = require('gulp-concat');
const cleancss          = require('gulp-clean-css');
const htmlmin           = require('gulp-htmlmin');
const template          = require('gulp-template');

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
let watching = false;

// -----------------------------------------------------------------------------
// Assets Build
// -----------------------------------------------------------------------------
async function exportSpriteSheet() {
    // Exporting the sprite sheet is the first step - using Aseprite, we take as input
    // all of our source aseprite files, and spit out a single spritesheet PNG and a JSON
    // file containing the x/y/w/h coordinates of the sprites in the spritesheet.

    let src = 'src/assets/*.aseprite';
    let png = 'src/assets/spritesheet-gen.png';
    let data = 'src/assets/spritesheet-gen.json';

    try {
        await AsepriteCli.exec(`--batch ${src} --sheet-type rows --sheet ${png} --data ${data} --format json-array`);
    } catch (e) {
        log.error(e);
        log.warn(chalk.red(`Failed to update ${png}, but continuing anyway...`));
    }
}

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
}

async function generateSpriteSheetData() {
    // After exporting the sprite sheet, we use the JSON data to update a source file used by
    // our asset loader in the game. This way we can freely update images without ever
    // hand-edting any coordinate data or worrying about the composition of the spritesheet.

    let data = 'src/assets/spritesheet-gen.json';
    let image = 'src/assets/spritesheet-gen.png';
    let output = 'src/js/SpriteSheet-gen.js';

    await ImageDataParser.parse(data, image, true, output);
}

async function generateWorld() {
    const mapFile = 'src/assets/world.tmx';
    const detailFile = 'src/assets/world.yaml';
    const worldFile = 'src/js/World-gen.js';

    await WorldBuilder.build(mapFile, detailFile, worldFile);
}

const buildAssets = gulp.series(
    exportFont,
    exportSpriteSheet,
    generateSpriteSheetData,
    generateWorld
);

// -----------------------------------------------------------------------------
// JavaScript Build
// -----------------------------------------------------------------------------
async function compileBuild() {
    try {
        const bundle = await rollup.rollup({
            input: 'src/js/index.js',
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
            file: 'temp/app.js',
            format: 'iife',
            name: 'app'
        });
    } catch (error) {
        // We are calling rollup's API directly instead of using the CLI, and the output is
        // not nearly as good. This hack imports and calls the same error handler that
        // the CLI uses, so we get the nice context in code showing us the issue.
        require('rollup/dist/shared/loadConfigFile').handleError(error, true);
        throw error;
    }
}

async function minifyBuild() {
    // TODO
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
    const jsContent = fs.readFileSync('temp/app.js');

    return gulp.src('src/index.html')
        .pipe(template({ css: cssContent, js: jsContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        //.pipe(gulp.src('dist/temp/app.js.map')) // no map??
        .pipe(gulp.dest('dist'));
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

    // Primary entry points
    build,
    watch,

    default: gulp.series(build, watch)
};
