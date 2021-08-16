// World

import { Screen } from './Screen';
import { WorldData } from './WorldData-gen';

export const World = {
    FLOOR: 46, // '.'

    init() {
        this.reset();
    },

    draw() {
        let tiles = this.floors[0].tiles;
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                let object = this.objectAt({ x, y, z: 0 });
                if (object) {
                    Screen.writeOnMap(x, y, object.char, this.colorFor(object));
                } else {
                    Screen.writeOnMap(x, y, String.fromCharCode(tiles[y][x]), Screen.WHITE);
                }
            }
        }
    },

    reset() {
        // We want to be careful and CLONE (not reference) the world data, because
        // this will be our "working copy" -- rooms and objects and even tiles might
        // get updated and moved during game logic.
        this.floors = WorldData.floors.map(floor => {
            return {
                tiles: floor.tiles.map(row => [...row]),
                objects: floor.objects.map(object => ({ ...object })),
                rooms: floor.rooms.map(room => ({ ...room }))
            };
        });
        this.bounds = WorldData.bounds;
        this.spawn = WorldData.spawn;
        this.strings = WorldData.strings;

        for (let floor of this.floors) {
            // "Lift" all objects off the floor, and get their default character
            for (let object of floor.objects) {
                object.char = String.fromCharCode(floor.tiles[object.y][object.x]);
                floor.tiles[object.y][object.x] = World.FLOOR;
            }
            floor.objectsByName = floor.objects.reduce((hash, entry) => (hash[entry.name] = entry, hash), {});
            floor.roomsByName = floor.rooms.reduce((hash, entry) => (hash[entry.name] = entry, hash), {});
        }
    },

    roomAt(pos) {
        return this.floors[pos.z].rooms.find(room =>
            pos.x >= room.x && pos.y >= room.y && pos.x < room.x + room.width && pos.y < room.y + room.height
        );
    },

    objectAt(pos) {
        return this.floors[pos.z].objects.find(object => object.x === pos.x && object.y === pos.y);
    },

    tileAt(pos) {
        let tiles = this.floors[pos.z].tiles;
        if (pos.x < 0 || pos.y < 0 || pos.x >= tiles[0].length || pos.y >= tiles.length) return ' ';
        return tiles[pos.y][pos.x];
    },

    canMoveInto(pos) {
        let tile = this.tileAt(pos);
        if (tile === 46 /* . */) return true;
        return false;
    },

    colorFor(object) {
        if (object.finished) return Screen.DIM;
        if (object.interacted) return Screen.YELLOW;
        return Screen.BLUE;
    }
};
