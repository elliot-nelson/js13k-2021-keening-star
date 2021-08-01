/**
 * `Text` is a singleton responsible for drawing text characters on the viewport. This
 * game uses a custom pixel font, so we need to implement some basic text handling
 * (splitting long lines, measuring character width, etc.) ourselves.
 */

import { Sprite } from './Sprite';
import { rgba, createCanvas } from './Util';
import { CHAR_WIDTH, CHAR_HEIGHT, CHARSHEET_WIDTH, SCREEN_SCALE } from './Constants';

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
        Text.white = { img: Sprite.font.img, scale: 1, border: 0, margin: 0 };

        // Recolored versions of the original font sheet, to use when constructing our glow.
        //
        // The color here is #33FF00 which is roughly the glow of the Kaypro II.
        Text.terminal = recolor(Text.white, rgba(51 + 16, 255, 0 + 16, 1));
        Text.terminal_shadow = recolor(Text.white, rgba(51, 255, 0, 0.4));

        // "Glowing" a bunch of characters on-screen is just too slow when you're doing 5
        // draw calls for every individual character. To avoid that, we can build a new
        // sprite sheet that is pre-scaled with the glow built in.
        Text.glow = bakeFontGlow(Text.terminal, Text.terminal_shadow, SCREEN_SCALE, 2, 2);
    },

    drawText(ctx, text, u, v, font = Text.terminal) {
        // The math gymnastics are a little hard to read (apologies). To render the
        // font asked for correctly, we need to have the font sheet image, the scale,
        // the border and the margin.
        //
        // The "scale" informs us what PRESCALING is applied to the font sheet, so
        // we know how big to render it (we don't do additional scaling here).
        //
        // The "border" tells us how many PRE-SCALE pixels of border exist in this
        // image. A border of 2 means a total of 2 pixels (so 1 on every side) were
        // used. This is pre-scale, so if the scale is 4, that means there are 4 pixels
        // of "space" around each character in the font sheet.
        //
        // The "margin" tells us how many POST-SCALE pixels of margin exist (in practice
        // this means, how many pixels of glow surround the character). You want to subtract
        // this margin when rendering the character so the character body is in the expected
        // spot on screen.
        let { img, scale, border, margin } = font;

        if (Array.isArray(text)) {
            for (let block of text) {
                Text.drawText(ctx, block.text, u + block.u * scale, v + block.v * scale, font);
            }
            return;
        }

        for (let idx = 0; idx < text.length; idx++) {
            let c = UNICODE_CHAR_MAP[text[idx]] || text.charCodeAt(idx);
            let k = (c - 0) * (CHAR_WIDTH + border);
            let drawable = (c !== 32);

            // We clear the canvas in every frame, and it's a HUGE speed advantage not to draw an
            // empty image (this check can save 1000+ drawImage calls a frame).
            if (drawable) {
                ctx.drawImage(
                    img,
                    (k * scale) % img.width,
                    Math.floor((k * scale) / (img.width)) * (CHAR_HEIGHT + border) * scale,
                    CHAR_WIDTH * scale,
                    CHAR_HEIGHT * scale,
                    u + margin,
                    v + margin,
                    CHAR_WIDTH * scale,
                    CHAR_HEIGHT * scale
                );
            }
            u += CHAR_WIDTH * scale;
        }
    },

    measureWidth(text, scale = 1) {
        return text.split('').reduce((sum, c) => sum + CHAR_WIDTH, 0) * scale;
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
    let canvas = createCanvas(font.img.width, font.img.height);
    canvas.ctx.fillStyle = color;
    canvas.ctx.fillRect(0, 0, font.img.width, font.img.height);
    canvas.ctx.globalCompositeOperation = 'destination-in';
    canvas.ctx.drawImage(font.img, 0, 0);

    // Return a new font with the same metadata, but a recolored image
    return {
        ...font,
        img: canvas.canvas
    };
}

function bakeFontGlow(font, glow, scale, border, margin) {
    // This function is a little complicated because it has to do several things at once.
    //
    // The idea is:
    //  - Take our original sheet of 8x16 characters
    //  - Build a NEW sheet, with additional "border" around each character, so that there is
    //    room for us to add a glow around each character without bleeding into our neighbors.
    //  - We want the glow baked in at an upscaled pixel size.
    //
    // What is the upscaled pixel size? Here for example, we are scaling up from 8x16 pixels
    // to 32x64 pixels for each characters. We then want the GLOW added around this new
    // 32x64 character, not the original size (this allows us to have a glow more tight than
    // the original chunky pixels we started with).
    //
    // A complication of HTML Canvas is that if you draw from a source canvas into a destination
    // canvas at a higher scale, you will "bleed" neighboring pixels from the source canvas.
    // To avoid this, we use a second temporary canvas and draw from the source into the temporary
    // canvas with no upscaling, then we draw from the temporary canvas into the upscaled canvas.
    //
    // (This means double the draws, but we only do this step once when the game loads, so it's
    // not a big deal.)
    let cols = font.img.width / CHAR_WIDTH, rows = font.img.height / CHAR_HEIGHT;

    let temp = createCanvas(CHAR_WIDTH, CHAR_HEIGHT);
    let canvas = createCanvas(
        cols * (CHAR_WIDTH + border) * scale,
        rows * (CHAR_HEIGHT + border) * scale
    )

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Glow (rendered on all 4 sides)
            temp.ctx.clearRect(0, 0, CHAR_WIDTH, CHAR_HEIGHT);
            temp.ctx.drawImage(
                glow.img,
                x * CHAR_WIDTH,
                y * CHAR_HEIGHT,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT
            );
            canvas.ctx.drawImage(
                temp.canvas,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * (CHAR_WIDTH + border) * scale + margin,
                y * (CHAR_HEIGHT + border) * scale,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );
            canvas.ctx.drawImage(
                temp.canvas,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * (CHAR_WIDTH + border) * scale,
                y * (CHAR_HEIGHT + border) * scale + margin,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );
            canvas.ctx.drawImage(
                temp.canvas,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * (CHAR_WIDTH + border) * scale + margin * 2,
                y * (CHAR_HEIGHT + border) * scale + margin,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );
            canvas.ctx.drawImage(
                temp.canvas,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * (CHAR_WIDTH + border) * scale + margin,
                y * (CHAR_HEIGHT + border) * scale + margin * 2,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );

            // Center character
            temp.ctx.clearRect(0, 0, CHAR_WIDTH, CHAR_HEIGHT);
            temp.ctx.drawImage(
                font.img,
                x * CHAR_WIDTH,
                y * CHAR_HEIGHT,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT
            );
            canvas.ctx.drawImage(
                temp.canvas,
                0, 0,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * (CHAR_WIDTH + border) * scale + margin,
                y * (CHAR_HEIGHT + border) * scale + margin,
                CHAR_WIDTH * scale,
                CHAR_HEIGHT * scale
            );
        }
    }

    return { img: canvas.canvas, scale, border, margin };
}
