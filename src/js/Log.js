// Log

import { STATUS_COL } from './Constants';
import { Screen } from './Screen';
import { World } from './World';

export const Log = {
    init() {
        this.entries = [];
    },

    add(message, formatCode = '') {
        //console.log(message);
        if (message[0] !== '%') {
            message = formatCode + '\xa5 ' + message;
        }

        this.entries.push(message.split('\n'));

        // In a real game, you'd definitely want some kind of normalized line-splitting
        // going on here... but for JS13k, I just have carefully crafted every string in
        // world.yaml to fit into the appropriate spaces (either the log/description
        // area, or the inventory description area).

        // For a while, I was trying to do the whole
        /*let array = [];

        while (message.length > LOG_WIDTH) {
            array.push(message.slice(0, LOG_WIDTH));
            message = message.slice(LOG_WIDTH);
        }
        if (message.length > 0) array.push(message);
        this.entries.push(array);*/
    },

    obtainedItem(id) {
        Log.add(`%y%0 You have obtained ${World.strings[id][0]}.`);
    },

    draw(lines = 3) {
        let boxHeight = lines + 2;
        let boxStart = 22 - lines;
        let temporaryBlanks = 0;

        if (this.entries[this.entries.length - 1].length < 3)
            temporaryBlanks = 3 - this.entries[this.entries.length - 1].length;
        let display = this.entries.flat();
        while (temporaryBlanks-- > 0) display.push('');
        if (display.length > lines) {
            display = display.slice(display.length - lines);
        }

        Screen.writeBox(0, boxStart, 80, boxHeight, Screen.DIM);
        Screen.write(STATUS_COL, boxStart, '\x98', Screen.DIM);

        for (let i = 0; i < display.length; i++) {
            Screen.write(2, boxStart + i + 1, display[i]);
        }
    }
};
