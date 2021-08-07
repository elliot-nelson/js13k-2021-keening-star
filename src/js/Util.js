// Util
//
// Miscellaneous utility functions that don't fit anywhere else.

export function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

export function createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    return { canvas, ctx };
}
