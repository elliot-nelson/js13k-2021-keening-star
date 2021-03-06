// Text
//
// Global object responsible for drawing text characters from our font sheet onto the
// Viewport. This includes generating recolored versions of the characters, measuring/
// wrapping long lines, etc.

import { FONT_WIDTH, FONT_HEIGHT } from './Constants';
import { Font } from './Font-gen';
import { rgba, createCanvas } from './Util';

export const Text = {
    init() {
        // We'll dynamically recolor the font sheet whenever a new rgba color is requested,
        // then cache it for future use.
        this.colorways = {};
        this.colorways[''] = Font.img;

        // The "white" font sheet, right from the sprite.
        Text.white = Font.img;

        // Recolored versions of the original font sheet, to use when constructing our glow.
        //
        // The color here is #33FF00 which is roughly the glow of the Kaypro II.
        Text.terminal = recolor(Text.white, rgba(51 + 16, 255, 0 + 16, 1));
        Text.terminal_shadow = recolor(Text.white, rgba(51, 255, 0, 0.4));
    },

    drawText(ctx, text, u, v, color = '') {
        //console.log(text, color);
        if (typeof text === 'number') text = String.fromCharCode(text);
        let scale = 1;
        let font = this.colorways[color];
        if (!font) {
            this.colorways[color] = font = recolor(Font.img, color);
        }

        if (Array.isArray(text)) {
            for (let block of text) {
                Text.drawText(ctx, block.text, u + block.u * scale, v + block.v * scale, font, scale);
            }
            return;
        }

        for (let idx = 0; idx < text.length; idx++) {
            let c = text.charCodeAt(idx);
            let k = (c - 0) * FONT_WIDTH;
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

    /*
    measureWidth(text, scale = 1) {
        return text.split('').reduce((sum, c) => sum + FONT_WIDTH, 0) * scale;
    },
    */

    /*
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
                cv += FONT_HEIGHT;
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
            h: FONT_HEIGHT
        }));
    }
    */
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
