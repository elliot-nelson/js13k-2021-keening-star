/**
 * `Screen` is a singleton that represents the virtual 80x25 character screen our game
 * lives in. Components like PlayingField will "draw" (write text onto) this virtual
 * screen each frame. Once all the text is written, the text will end up rendered on
 * the viewport (canvas) in the browser.
 */

import { Camera } from './Camera';
import { SCREEN_WIDTH, SCREEN_HEIGHT, FONT_WIDTH, FONT_HEIGHT } from './Constants';
import { Viewport } from './Viewport';
import { Text } from './Text';

export const Screen = {
    init() {
        this.screen = [];
        for (let y = 0; y < SCREEN_HEIGHT; y++) {
            this.screen.push([]);
        }
        this.clear();
    },

    clear() {
        for (let y = 0; y < SCREEN_HEIGHT; y++) {
            for (let x = 0; x < SCREEN_WIDTH; x++) {
                this.screen[y][x] = ' ';
            }
        }
    },

    write(x, y, text) {
        if (!Array.isArray(text)) text = [text];

        for (let j = 0; j < text.length; j++) {
            for (let i = 0; i < text[j].length; i++) {
                this.screen[y + j][x + i] = text[j][i];
            }
        }
    },

    writeOnMap(x, y, text) {
        let offset = {
            x: 30 - Camera.pos.x,
            y : 8 - Camera.pos.y
        };

        this.write(x + offset.x, y + offset.y, text);
    },

    raw(x, y, text) {
        Text.drawText(Viewport.ctx, Text.splitParagraph(text, Viewport.width), x * FONT_WIDTH, y * FONT_HEIGHT);
    },

    draw(ctx) {
        for (let y = 0; y < SCREEN_HEIGHT; y++) {
            for (let x = 0; x < SCREEN_WIDTH; x++) {
                Text.drawText(ctx, this.screen[y][x], x * FONT_WIDTH, y * FONT_HEIGHT, Text.white);
            }
        }
    }
};
