// FontExporter

const fs = require('fs');
const util = require('util');
const imageToBase64 = require('image-to-base64');

const FontExporter = {
    async export(imageFile, outputFile) {
        let base64 = await imageToBase64(imageFile);
        let uri = `data:image/png;base64,${base64}`;

        FontExporter._writeOutputFile(uri, outputFile);
    },
    _writeOutputFile(uri, outputFile) {
        let js = fs.readFileSync(outputFile, 'utf8');
        let lines = js.split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated>/));

        let data = { uri };
        let generated = util.inspect(data, { compact: true, maxArrayLength: Infinity, depth: Infinity });
        generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, generated, 'utf8');
    }
}

module.exports = FontExporter;
