/**
 * `Screen` is a singleton that represents the virtual 80x25 character screen our game
 * lives in. Components like PlayingField will "draw" (write text onto) this virtual
 * screen each frame. Once all the text is written, the text will end up rendered on
 * the viewport (canvas) in the browser.
 */

import { Camera } from './Camera';
import { SCREEN_WIDTH, SCREEN_HEIGHT, FONT_WIDTH, FONT_HEIGHT, FLICKER_FRAME_2 } from './Constants';
import { Game } from './Game';
import { Text } from './Text';
import { rgba } from './Util';

/*
const SMUDGE_OFFSETS = [3,1,2,0,4,5,1,0,2,0];
let smudgeIndex = 0;
const smudgeOffset = () => {
    smudgeIndex = (smudgeIndex + 1) % SMUDGE_OFFSETS.length;
    return SMUDGE_OFFSETS[smudgeIndex];
};
*/

export const Screen = {
    // Terminal color "codes". In general, colors come in groups of 3,
    // a primary color and then some darker shades to be used when drawing
    // what the player can see.
    BRIGHT:        1,
    BRIGHT2:       2, // N/A
    BRIGHT3:       3, // N/A
    WHITE:         4,
    WHITE2:        5,
    WHITE3:        6,
    DIM:           7,
    DIM2:          8, // N/A
    DIM3:          9, // N/A
    SHADOW:       10,
    SHADOW2:      11, // N/A
    SHADOW3:      12, // N/A
    RED:          13,
    RED2:         14,
    RED3:         15,
    GREEN:        16,
    GREEN2:       17,
    GREEN3:       18,
    BLUE:         19,
    BLUE2:        20,
    BLUE3:        21,
    YELLOW:       22,
    YELLOW2:      23,
    YELLOW3:      24,
    PURPLE:       25,
    PURPLE2:      26,
    PURPLE3:      27,
    DARK_PURPLE:  28,
    DARK_PURPLE2: 29,
    DARK_PURPLE3: 30,

    // Useful character codes
    SPACE:   0x20,

    init() {
        this.screen = [];
        this.smudge = 5;
        this.clear();

        // Terminal color names to hex color mappings
        //
        // Primary colors are from the palette ENDESGA 32:
        //   https://lospec.com/palette-list/endesga-32
        //
        // The DIM and DIMMER varieties are obtained using the chroma-js library,
        // with a 5-stop scale from the color to black, e.g.:
        //
        //   chroma.scale(['#733e39', '#000000']).mode('lab').colors(5)
        //
        // After generating the 5 colors, the first 3 entries are the primary,
        // dim, and dimmer color varieties.
        //
        // For white, it is 8 stops and take the first 5 entries.
        //
        Screen.COLORS = {
            [Screen.BRIGHT]:       '#ffffff',
            [Screen.BRIGHT2]:      '#ffffff',
            [Screen.BRIGHT3]:      '#ffffff',

            [Screen.WHITE]:        '#d6d6d6',
            [Screen.WHITE2]:       '#afafaf',
            [Screen.WHITE3]:       '#898989',

            [Screen.DIM]:          '#656565',
            [Screen.DIM2]:         '#656565',
            [Screen.DIM3]:         '#656565',

            [Screen.SHADOW]:       '#262b44',
            [Screen.SHADOW2]:      '#262b44',
            [Screen.SHADOW3]:      '#262b44',

            [Screen.RED]:          '#e43b44',
            [Screen.RED2]:         '#a73134',
            [Screen.RED3]:         '#6d2525',

            [Screen.GREEN]:        '#63c74d',
            [Screen.GREEN2]:       '#4c913b',
            [Screen.GREEN3]:       '#355f2a',

            [Screen.BLUE]:         '#0099db',
            [Screen.BLUE2]:        '#1c709f',
            [Screen.BLUE3]:        '#1d4a67',

            [Screen.YELLOW]:       '#fee761',
            [Screen.YELLOW2]:      '#b8a84a',
            [Screen.YELLOW3]:      '#776c33',

            [Screen.PURPLE]:       '#b55088',
            [Screen.PURPLE2]:      '#853d64',
            [Screen.PURPLE3]:      '#572b43',

            [Screen.DARK_PURPLE]:  '#68386c',
            [Screen.DARK_PURPLE2]: '#4e2c51',
            [Screen.DARK_PURPLE3]: '#352037',

            [Screen.BROWN]:        '#733e39',
            [Screen.BROWN2]:       '#56302c',
            [Screen.BROWN3]:       '#3a221f',
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
            let c = text.charCodeAt(i);

            if (text[i] === '\n') {
                x = ox;
                y++;
                continue;
            }

            if (text[i] === '%') {
                switch (text[++i]) {
                    case 'd':
                        color = Screen.DIM;
                        continue;
                    case 'r':
                        color = Screen.RED;
                        continue;
                    case 'g':
                        color = Screen.GREEN;
                        continue;
                    case 'b':
                        color = Screen.BLUE;
                        continue;
                    case 'y':
                        color = Screen.YELLOW;
                        continue;
                    case 'w':
                        color = Screen.WHITE;
                        continue;
                    case 'W':
                        color = Screen.WHITE | Screen.BRIGHT;
                        continue;
                    case '0':
                        c = 0xa5;
                        break;
                    case '1':
                        c = 0xa4;
                        break;
                    default:
                        i--;
                }
            }

            this.screen[y * SCREEN_WIDTH + x] = c | (color << 8);
            x++;
            if (x >= x2) {
                x = ox;
                y++;
            }
        }
    },

    writeOnMap(x, y, text, color, x2) {
        let offset = {
            x: 32 - Camera.pos.x,
            y : 12 - Camera.pos.y
        };

        this.write(x + offset.x, y + offset.y, text, color, x2);
    },

    writeBox(x, y, w, h, color) {
        if (w > 2 && h > 2) {
            Screen.clear(x + 1, y + 1, w - 2, h - 2);
        }
        this.write(x, y, `\x95${'\x91'.repeat(w - 2)}\x96`, color);
        this.write(x, y + h - 1, `\x94${'\x91'.repeat(w - 2)}\x93`, color);
        for (let i = y + 1; i < y + h - 1; i++) {
            this.write(x, i, '\x90', color);
            this.write(x + w - 1, i, '\x90', color);
        }
    },

    draw(ctx) {
        if (Game.frame % FLICKER_FRAME_2 > 0) {
            for (let y = 0; y < SCREEN_HEIGHT; y++) {
                for (let x = 0; x < SCREEN_WIDTH; x++) {
                    let c = this.screen[y * SCREEN_WIDTH + x];
                    let c2 = (c & 0xFF);
                    if (c2 !== 32 /*&& c2 < 128*/ && this.smudge > 0) c2 += this.smudge;
                    Text.drawText(ctx, c2, x * FONT_WIDTH, y * FONT_HEIGHT, Screen.COLORS[c >> 8]);
                }
            }
        }
    }
};
