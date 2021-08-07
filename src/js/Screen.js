/**
 * `Screen` is a singleton that represents the virtual 80x25 character screen our game
 * lives in. Components like PlayingField will "draw" (write text onto) this virtual
 * screen each frame. Once all the text is written, the text will end up rendered on
 * the viewport (canvas) in the browser.
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
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

    draw(ctx) {
        let text = this.screen.map(row => row.join('')).join('\n');

        Text.drawText(
            ctx,
            Text.splitParagraph(text, Viewport.width),
            0, 0,
            Text.white
        );
    }
};
