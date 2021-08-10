const fs = require('fs');
const util = require('util');
const yaml = require('js-yaml');
const tmx = require('./tmx-parser');

/**
 * Build the "world", a big data blob containing all the information we need about the
 * world the player plays in, and assemble it as a source file. The map data comes from
 * Tiled, and data like stats and messages and descriptions comes from a YAML file.
 */
const WorldBuilder = {
    /*
     * Combine a Tiled (tmx) file with a YAML data file to produce a single
     * source (javascript) file included in the game.
     */
    async build(mapFile, detailFile, outputFile) {
        let data = await this._extractWorldFromTmx(mapFile);

        let yamlData = yaml.load(fs.readFileSync(detailFile));
        Object.assign(data, yamlData);

        this._writeOutputFile(data, outputFile);
    },

    /*
     * We rely heavily on convention here -- the Tiled "world" is made up of multiple floors,
     * each represented by a Layer Group containing several layers like "TILES", "ROOMS", and
     * "OBJECTS". The data from all the layers in a group is combined to represent the data
     * for a particular floor.
     */
    async _extractWorldFromTmx(inputFile) {
        const tiled = await tmx.parseTmxFile(inputFile);

        const floors = [];

        for (let layer of tiled.layers.filter(layer => layer.type === 'group')) {
            let floor = {
                name: layer.name,
                tiles: [],
                rooms: [],
                objects: []
            };

            for (let sublayer of layer.layers) {
                if (sublayer.name === 'TILES') {
                    floor.tiles = sublayer.tiles;
                }
                if (sublayer.name === 'ROOMS') {
                    floor.rooms = sublayer.objects;
                }
                if (sublayer.name === 'OBJECTS') {
                    floor.objects = sublayer.objects;
                }
            }

            if (floor.tiles) {
                floors.push(floor);
            }
        }

        const world = { floors, bounds: this._getBounds(floors) };

        this._positionRoomsAndObjects(world, tiled.tilewidth, tiled.tileheight);
        this._shrinkWorld(world);
        this._normalizeWorld(world);

        return world;
    },

    /*
     * Return the min/max bounds of the entire world in Tiled. The actual Tiled world is
     * probably quite a bit bigger than it needs to be, for ease of expanding in any
     * direction in the editor.
     */
    _getBounds(floors) {
        let bounds = [[Infinity, Infinity], [-Infinity, -Infinity]];
        for (let floor of floors) {
            for (let y = 0; y < floor.tiles.length; y++) {
                for (let x = 0; x < floor.tiles[y].length; x++) {
                    if (floor.tiles[y][x] !== 0) {
                        if (x < bounds[0][0]) bounds[0][0] = x;
                        if (x > bounds[1][0]) bounds[1][0] = x;
                        if (y < bounds[0][1]) bounds[0][1] = y;
                        if (y > bounds[1][1]) bounds[1][1] = y;
                    }
                }
            }
        }

        bounds[1][0]++;
        bounds[1][1]++;

        return bounds;
    },

    /*
     * Convert the positions of rooms and objects, which in are in "pixel" space in Tiled,
     * into coordinate space, so they match up with the tiles they are drawn on.
     */
    _positionRoomsAndObjects(world, tileWidth, tileHeight) {
        for (let floor of world.floors) {
            for (let object of floor.objects) {
                object.x = Math.floor(object.x / tileWidth);
                object.y = Math.floor(object.y / tileHeight);
            }
            for (let room of floor.rooms) {
                // Rooms are "drawn" as rectangles on top of the walls in Tiled and aren't guaranteed
                // to be exactly right, so we want anything "inside the grid" to count.
                let x2 = Math.floor((room.x + room.width) / tileWidth);
                let y2 = Math.floor((room.y + room.height) / tileWidth);
                room.x = Math.floor(room.x / tileWidth);
                room.y = Math.floor(room.y / tileHeight);
                room.width = x2 - room.x;
                room.height = y2 - room.y;
            }
        }
    },

    /*
     * Given new bounds, shrink the entire world as small as possible to save space, making sure
     * to adjust the coordinates of rooms and objects at the same time.
     */
    _shrinkWorld(world) {
        let startX = world.bounds[0][0],
            endX = world.bounds[1][0],
            startY = world.bounds[0][1],
            endY = world.bounds[1][1];

        for (let floor of world.floors) {
            floor.tiles = floor.tiles.slice(startY, endY).map(row => row.slice(startX, endX));
            for (let object of floor.objects) {
                object.x -= startX;
                object.y -= startY;
            }
            for (let room of floor.rooms) {
                room.x -= startX;
                room.y -= startY;
            }
        }

        world.bounds = [[0, 0], [endX - startX, endY - startY]];
    },

    /*
     * Grab-bag of small modifications to the world data to line it up with the expectations
     * of the game engine. Mostly we are converting from "Tiled" values to in-game "ASCII" values,
     * while making a few other miscellaneous adjustments.
     */
    _normalizeWorld(world) {
        let spawn;
        let floorNumber = 0;

        for (let floor of world.floors) {
            floor.id = floorNumber++;

            for (let y = 0; y < floor.tiles.length; y++) {
                for (let x = 0; x < floor.tiles[y].length; x++) {
                    // All values in Tiled are off by one (since 1 is the "first tile")
                    floor.tiles[y][x]--;

                    // Value 0 (blank) is represented in-game as ' ' (space)
                    if (floor.tiles[y][x] < 0) floor.tiles[y][x] = 32;

                    // Value 64 ('@') is the spawn location
                    if (floor.tiles[y][x] === 64) {
                        if (spawn) throw new Error('Multiple spawn locations detected in world.');
                        spawn = [x, y, floor.id];
                        floor.tiles[y][x] = 46; // '.'
                    }
                }
            }
        }

        if (!spawn) throw new Error('No spawn location detected in world.');

        world.spawn = spawn;
    },

    /*
     * Update the generated World source file with the new world data.
     */
    _writeOutputFile(data, outputFile) {
        let js = fs.readFileSync(outputFile, 'utf8');
        let lines = js.split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated>/));

        let generated = util.inspect(data, { compact: true, maxArrayLength: Infinity, depth: Infinity });
        generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, generated, 'utf8');
    }
};

module.exports = WorldBuilder;
