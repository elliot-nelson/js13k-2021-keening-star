const fs = require('fs');
const util = require('util');
const imageToBase64 = require('image-to-base64');

/**
 * The image data parser takes a JSON file, produced by Aseprite when it exported
 * our sprite sheet, and turns it into a JavaScript file that will become part of our
 * build.
 *
 *  - Because the produced JS file is checked in, along with the produced spritesheet,
 *    explanatory changes to the sheet are easily visible in text diffs.
 *
 *  - My already existing minification step will mangle the names of all the frames, so
 *    there's no need to worry about the original Aseprite file names taking up space.
 *
 *  - Optionally, we can also base64-encode the produced image directly into the
 *    JS file. This is ideal for JS13k where you pay a premium of +100 bytes just for
 *    the existence of the PNG file in the ZIP archive.
 *
 * Notes:
 *
 *  - If you've updated images, the build is no longer pure (i.e., it has the side effect
 *    of modifying files in the /src folder that need to be checked in).
 *
 *  - Need to be careful with your "gulp watch" filespec to avoid rebuild loops.
 */
const ImageDataParser = {
  async parse(dataFile, imageFileName, isBase64, outputFile) {
    let data = ImageDataParser._parseDataFile(dataFile);
    let uri = imageFileName;

    if (isBase64) {
      let base64 = await imageToBase64(imageFileName);
      uri = `data:image/png;base64,${base64}`;
    }

    ImageDataParser._writeOutputFile(data, uri, outputFile);
  },
  _parseDataFile(dataFile) {
    let json = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    let data = {};

    for (let frame of json.frames) {
      let id = frame.filename.replace('.aseprite', '');
      let number = (parseInt(id.split(' ')[1], 10) || 0);
      id = id.split(' ')[0];

      data[id] = (data[id] || []);
      data[id][number] = [
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h
      ];
    }

    return data;
  },
  _writeOutputFile(data, uri, outputFile) {
    let js = fs.readFileSync(outputFile, 'utf8');
    let lines = js.split('\n');
    let prefix = lines.findIndex(value => value.match(/<generated>/));
    let suffix = lines.findIndex(value => value.match(/<\/generated>/));

    data = { ... data, uri };

    let generated = util.inspect(data, { compact: true, maxArrayLength: Infinity, depth: Infinity });
    generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

    fs.writeFileSync(outputFile, generated, 'utf8');
  }
};

module.exports = ImageDataParser;
