// World

import { Screen } from './Screen';
import { WorldData } from './WorldData-gen';

export const World = {
    init() {
        this.floors = WorldData.floors;
        this.spawn = WorldData.spawn;
        this.strings = WorldData.strings;
        this.reset();
    },

    draw() {
        let tiles = this.floors[0].tiles;
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                let object = this.objectAt({ x, y, z: 0 });
                Screen.writeOnMap(x, y, String.fromCharCode(tiles[y][x]), object ? Screen.RED : Screen.WHITE);
            }
        }
    },

    reset() {
        for (let floor of this.floors) {
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
    }
};
