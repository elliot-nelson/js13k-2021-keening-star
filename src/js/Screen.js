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
    DIM:     0x00,
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

    init() {
        this.screen = [];
        this.clear();

        // Terminal color names to hex color mappings
        Screen.COLORS = {
            [Screen.DIM]:                   rgba(144, 144, 144, 1),
            [Screen.WHITE]:                 rgba(214, 214, 214, 1),
            [Screen.WHITE | Screen.BRIGHT]: rgba(255, 255, 255, 1),
            [Screen.RED]:                   rgba(214, 69,  46,  1),
            [Screen.YELLOW]:                rgba(238, 212, 83,  1),
            [Screen.BLUE]:                  rgba(70,  151, 226, 1)
        };
    },

    clear(startX = 0, startY = 0, width = SCREEN_WIDTH, height = SCREEN_HEIGHT) {
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                this.screen[y * SCREEN_WIDTH + x] = Screen.SPACE | (Screen.WHITE << 8);
            }
        }
    },

    write(x, y, text, color = Screen.WHITE, x2 = SCREEN_WIDTH) {
        if (typeof text !== 'string') throw new Error('string');
        //if (color === undefined) color = Screen.WHITE;

        let ox = x, oy = y;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                x = ox;
                y++;
            } else if (text[i] === '\xff') {
                console.log('FOUND COLOR CODE');
                color = text[++i].charCodeAt(0);
            } else if (text[i] === '%') {
                switch (text[++i]) {
                    case 'R':
                        color = Screen.RED;
                        break;
                    case 'Y':
                        color = Screen.YELLOW;
                        break;
                    case 'D':
                        color = Screen.DIM;
                        break;
                }
            } else {
                this.screen[y * SCREEN_WIDTH + x] = text.charCodeAt(i) | (color << 8);
                x++;
                if (x >= x2) {
                    x = ox;
                    y++;
                }
            }
        }
    },

    writeOnMap(x, y, text, color, x2) {
        let offset = {
            x: 30 - Camera.pos.x,
            y : 8 - Camera.pos.y
        };

        this.write(x + offset.x, y + offset.y, text, color, x2);
    },

    writeBox(x, y, w, h, color) {
        this.write(x, y, `\x95${'\x91'.repeat(w - 2)}\x96`, color);
        this.write(x, y + h - 1, `\x94${'\x91'.repeat(w - 2)}\x93`, color);
        for (let i = y + 1; i < y + h - 1; i++) {
            this.write(x, i, '\x90', color);
            this.write(x + w - 1, i, '\x90', color);
        }
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
