// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
const AsepriteCli       = require('aseprite-cli');
const chalk             = require('chalk');
const gulp              = require('gulp');

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
let watching = false;
let fast = process.argv.includes('--fast');

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

    try {
        console.log(await AsepriteCli.exec([
            '--tag', 'font',
            src,
            '--sheet', png
        ]));
    } catch (e) {
        // Allow developers without Aseprite to build the project (if desired, they'll need
        // to update the generated image files manually).
        log.error(e);
        log.warn(chalk.red(`Failed to update ${src}, but continuing anyway...`));
    }
}

// -----------------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------------
const build = gulp.series(
    exportFont
);

// -----------------------------------------------------------------------------
// Task List
// -----------------------------------------------------------------------------
module.exports = {
    // Primary entry points
    build,

    default: gulp.series(build)
};
