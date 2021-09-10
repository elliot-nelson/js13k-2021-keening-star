// World

import { FLICKER_FRAME_1, STATUS_COL, TYPE_HIDDEN } from './Constants';
import { Game } from './Game';
import { Screen } from './Screen';
import { WorldData } from './WorldData-gen';

export const World = {
    FLOOR: 46, // '.'

    init() {
        this.reset();
        this.visions = [];
    },

    draw() {
        if (Game.frame % FLICKER_FRAME_1 > 1) {
            let tiles = this.floors[0].tiles;
            for (let y = 0; y < tiles.length; y++) {
                for (let x = 0; x < tiles[y].length; x++) {
                    if (this.floors[0].visible[y][x]) {
                        let object = this.objectAt({ x, y, z: 0 });
                        if (object && object.type !== TYPE_HIDDEN) {
                            Screen.writeOnMap(x, y, object.char, this.colorForObject(object));
                        } else {
                            let c = String.fromCharCode(tiles[y][x]);
                            Screen.writeOnMap(x, y, c, this.colorForTile(c));
                        }
                    }
                }
            }
        }

        Screen.write(0, 0, ' '.repeat(STATUS_COL));
        Screen.write(0, 1, ' '.repeat(STATUS_COL));
        Screen.write(0, 2, ' '.repeat(STATUS_COL));

        if (Game.player.room) {
            let name = World.strings[Game.player.room.id][0];
            Screen.write(Math.floor((STATUS_COL - name.length) / 2), 1, name, Screen.GREEN);
        }

        /*
        if (Game.frame % 133 === 0) {
            console.log('generating visions');
            this.visions = [];
            for (let i = 0; i < 10; i++) {
                this.visions.push([
                    Math.floor(Math.random() * tiles[0].length),
                    Math.floor(Math.random() * tiles.length),
                    String.fromCharCode(97 + Math.floor(Math.random() * 26))
                ]);
            }
        } else if (Game.frame % 133 >= 5 && Game.frame % 133 <= 25) {
            for (let vision of this.visions) {
                Screen.writeOnMap(vision[0], vision[1], vision[2], Screen.RED);
            }
        }
        */
    },

    reset() {
        // We want to be careful and CLONE (not reference) the world data, because
        // this will be our "working copy" -- rooms and objects and even tiles might
        // get updated and moved during game logic.
        this.floors = WorldData.floors.map(floor => {
            return {
                tiles: floor.tiles.map(row => [...row]),
                visible: floor.tiles.map(row => row.map(c => false)),
                objects: floor.objects.map(object => ({ id: object[0], x: object[1], y: object[2], type: object[3] })),
                rooms: floor.rooms.map(room => ({ id: room[0], x: room[1], y: room[2], width: room[3], height: room[4] })),
                triggers: floor.triggers.map(trigger => ({ ...trigger }))
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

    objectsById(id, map) {
        let list = [];
        for (let floor of this.floors) {
            for (let object of floor.objects) {
                if (object.id === id) {
                    list.push(object);
                    if (map) map(object, floor);
                }
            }
        }
        return list;
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

    colorForObject(object) {
        if (object.finished) return Screen.DIM;
        if (object.interacted) return Screen.YELLOW;
        return Screen.BLUE;
    },

    colorForTile(tile) {
        return tile === '.' ? Screen.DIM : Screen.WHITE;
    },

    makeVisible(roomId) {
        for (let floor of this.floors) {
            for (let room of floor.rooms) {
                if (room.id === roomId) {
                    for (let y = room.y; y < room.y + room.height; y++) {
                        for (let x = room.x; x < room.x + room.width; x++) {
                            floor.visible[y][x] = true;
                        }
                    }
                }
            }
        }
    },
};
