// LogScreen

import { LOG_CLOSED_LINES, LOG_OPEN_LINES, SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';

export class LogScreen {
    constructor() {
        this.lines = LOG_CLOSED_LINES;
        this.offset = 0;
    }

    update() {
        if (Input.pressed[Input.Action.BACK]) {
            this.closing = true;
        }

        if (this.closing) {
            this.lines--;
            if (this.lines <= LOG_CLOSED_LINES) {
                this.cull = true;
                return;
            }
        } else {
            if (this.lines < LOG_OPEN_LINES) this.lines++;

            if (Input.pressed[Input.Action.UP]) {
                this.offset++;
            } else if (Input.pressed[Input.Action.DOWN]) {
                this.offset--;
            }
        }

        this.offset = Math.min(this.offset, 0);
        this.offset = Math.max(this.offset, Log.entries.flat().length - this.lines);
    }

    draw() {
        Screen.clear(0, SCREEN_HEIGHT - this.lines + 1, SCREEN_WIDTH, this.lines + 2);
        Log.draw(this.lines, this.offset);
    }
}
