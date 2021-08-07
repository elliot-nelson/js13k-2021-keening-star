// Text
//
// Global object responsible for drawing text characters from our font sheet onto the
// Viewport. This includes generating recolored versions of the characters, measuring/
// wrapping long lines, etc.

import { Sprite } from './Sprite';
import { rgba, createCanvas } from './Util';
import { FONT_WIDTH, FONT_HEIGHT, FONT_ROWS, FONT_COLS } from './Constants';

// In our character sheet, chars 0x00-0x7F are standard ASCII, below that we put whatever
// characters are convenient for us. Here we can choose to map unicode characters to positions
// 0x80+ in the charsheet, making it easy for us to render things like special characters,
// box drawing characters, etc.
//
// Note: I like pasting actual characters instead of codes ("├" instead of "\u251C"). If you
// do this, don't forget to explicitly tell the browser what charset your JS file is, or it
// won't execute -- see `index.html` for an example.
const SUPPORTED_UNICODE_CHARS = [
    '─│┌┐└┘├┤┬┴┼╳╳╳╳╳',
    '═║╔╗╚╝╠╣╦╩╬╳╳╳╳╳',
    '↑↓←→╳╳╳╳╳╳╳╳╳╳╳╳'
].join('');

const UNICODE_CHAR_MAP = SUPPORTED_UNICODE_CHARS.split('').reduce((map, char, idx) => {
    map[char] = 0x80 + idx;
    return map;
}, {});

/**
 * Text
 *
 * Utilities for drawing text using in-game pixel font.
 */
export const Text = {
    init() {
        // The "white" font sheet, right from the sprite.
        Text.white = Sprite.font.img;

        // Recolored versions of the original font sheet, to use when constructing our glow.
        //
        // The color here is #33FF00 which is roughly the glow of the Kaypro II.
        Text.terminal = recolor(Text.white, rgba(51 + 16, 255, 0 + 16, 1));
        Text.terminal_shadow = recolor(Text.white, rgba(51, 255, 0, 0.4));
    },

    drawText(ctx, text, u, v, font = Text.white, scale = 1) {
        if (Array.isArray(text)) {
            for (let block of text) {
                Text.drawText(ctx, block.text, u + block.u * scale, v + block.v * scale, font, scale);
            }
            return;
        }

        for (let idx = 0; idx < text.length; idx++) {
            let c = UNICODE_CHAR_MAP[text[idx]] || text.charCodeAt(idx);
            let k = (c - 0) * (FONT_WIDTH + border);
            let drawable = (c !== 32);

            // We clear the canvas in every frame, and it's a HUGE speed advantage not to draw an
            // empty image (this check can save 1000+ drawImage calls a frame).
            if (drawable) {
                ctx.drawImage(
                    font,
                    (k * scale) % font.width,
                    Math.floor((k * scale) / (font.width)) * FONT_HEIGHT * scale,
                    FONT_WIDTH * scale,
                    FONT_HEIGHT * scale,
                    u ,
                    v,
                    FONT_WIDTH * scale,
                    FONT_HEIGHT * scale
                );
            }
            u += FONT_WIDTH * scale;
        }
    },

    measureWidth(text, scale = 1) {
        return text.split('').reduce((sum, c) => sum + FONT_WIDTH, 0) * scale;
    },

    splitParagraph(text, w, h) {
        let cu = 0, cv = 0;
        let next = () => ({ text: '', u: cu, v: cv });
        let wip = next();
        let list = [];

        for (let c of text.split('')) {
            let cWidth = Text.measureWidth(c, 1);
            if (c === '\n' || cu + cWidth > w) {
                let saved = '';
                if (c !== '\n' && c !== ' ') {
                    let space = wip.text.split(' ');
                    if (space.length > 1) {
                        saved = space.pop();
                        wip.text = space.join(' ');
                    }
                }
                if (wip.text.length > 0) list.push(wip);
                cu = 0;
                cv += (CHAR_HEIGHT);
                wip = next();
                if (saved.length > 0) {
                    wip.text = saved;
                    cu += Text.measureWidth(wip.text, 1);
                }
            } else {
                cu += cWidth;
            }
            if (c !== '\n') {
                wip.text = wip.text + c;
            }
        }

        if (wip.text.length > 0) list.push(wip);

        return list.map(line => ({
            ...line,
            w: Text.measureWidth(line.text, 1),
            h: CHAR_HEIGHT
        }));
    }
};

// Text utility functions, for manipulating the font sheet images

function recolor(font, color) {
    let canvas = createCanvas(font.width, font.height);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 0, font.width, font.height);
    canvas.ctx.globalCompositeOperation = 'destination-in';
    canvas.ctx.drawImage(font, 0, 0);

    return canvas.canvas;
}
