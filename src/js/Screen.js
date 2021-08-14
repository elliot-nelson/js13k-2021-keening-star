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
import { rgba } from './Util';

export const Screen = {
    // Terminal color codes
    BLACK:   0x00,
    RED:     0x01,
    GREEN:   0x02,
    YELLOW:  0x03,
    BLUE:    0x04,
    MAGENTA: 0x05,
    CYAN:    0x06,
    WHITE:   0x07,
    BRIGHT:  0x08,

    // Useful character codes
    SPACE:   0x20,

    // Terminal color names to hex color mappings
    COLORS: {
        [WHITE]:        rgba(214, 214, 214, 1),
        [WHITE|BRIGHT]: rgba(255, 255, 255, 1),
        [RED]:          rgba(255, 30, 30, 1)
    },

    init() {
        this.screen = [];
        this.clear();
    },

    clear() {
        for (let y = 0; y < SCREEN_HEIGHT; y++) {
            for (let x = 0; x < SCREEN_WIDTH; x++) {
                this.screen[y * SCREEN_WIDTH + x] = Screen.SPACE | (Screen.WHITE << 8);
            }
        }
    },

    write(x, y, text, color) {
        if (!Array.isArray(text)) text = [text];
        if (color === undefined) color = Screen.WHITE;

        for (let j = 0; j < text.length; j++) {
            for (let i = 0; i < text[j].length; i++) {
                this.screen[(y + j) * SCREEN_WIDTH + x + i] = text[j].charCodeAt(i) | (color << 8);
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
                let c = this.screen[y * SCREEN_WIDTH + x];
                Text.drawText(ctx, c & 0xFF, x * FONT_WIDTH, y * FONT_HEIGHT, Screen.COLORS[c >> 8]);
            }
        }
    }
};
