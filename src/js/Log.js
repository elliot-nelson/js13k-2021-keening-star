// Log

import { STATUS_COL } from './Constants';
import { Screen } from './Screen';

const LOG_WIDTH = 78;

export const Log = {
    init() {
        this.entries = [];
    },

    add(message) {
        this.entries.push(message.split('\n'));
        /*let array = [];

        while (message.length > LOG_WIDTH) {
            array.push(message.slice(0, LOG_WIDTH));
            message = message.slice(LOG_WIDTH);
        }
        if (message.length > 0) array.push(message);
        this.entries.push(array);*/
    },

    draw(lines = 3) {
        let boxHeight = lines + 2;
        let boxStart = 22 - lines;

        let display = this.entries.flat();
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
