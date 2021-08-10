// Util
//
// Miscellaneous utility functions that don't fit anywhere else.

import { World } from './World-gen';

export function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

export function xyz2pos(x, y, z) {
    return { x, y, z };
}

export function uni(chars) {
    // In our character sheet, chars 0x00-0x7F are standard ASCII, below that we put whatever
    // characters are convenient for us. Here we can choose to map unicode characters to positions
    // 0x80+ in the charsheet, making it easy for us to render things like special characters,
    // box drawing characters, etc.
    //
    // Note that this technically isn't necessary; the font sheet might map 0x81 to "wall corner",
    // for example, and in Tiled the value 0x81 will display that wall corner. But it's nice to
    // be able to put _actual wall corners_ in strings inside your JavaScript code, and in your
    // editor that character will be more like 0x251C. I could just type '\x81' in code, but
    // this convert lets me convert 0x251C to 0x81.
    //
    // If you choose to do this, don't forget to tell the browser your encoding in your <script> tag!
    const SUPPORTED_UNICODE_CHARS = [
        '│─┼┘└┌┐┬┴├┤╳╳╳╳╳',
        '║═╬╝╚╔╗╦╩╠╣╳╳╳╳╳',
        '↑↓←→╳╳╳╳╳╳╳╳╳╳╳╳'
    ].join('');
    const UNICODE_CHAR_MAP = SUPPORTED_UNICODE_CHARS.split('').reduce((map, char, idx) => {
        map[char] = 0x80 + idx;
        return map;
    }, {});
    return chars.split('').map(c => String.fromCharCode(UNICODE_CHAR_MAP[c]) || c).join('');
}

export function createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

export function roomAt(pos) {
    return World.floors[pos.z].rooms.filter(room =>
        pos.x >= room.x && pos.y >= room.y && pos.x < room.x + room.width && pos.y < room.y + room.height
    );
}

export function objectAt(pos) {
    return World.floors[pos.z].objects.find(object => object.x === pos.x && object.y === pos.y);
}

export function tileAt(pos) {
    let tiles = World.floors[pos.z].tiles;
    if (pos.x < 0 || pos.y < 0 || pos.x >= tiles[0].length || pos.y >= tiles.length) return ' ';
    return tiles[y][x];
}
