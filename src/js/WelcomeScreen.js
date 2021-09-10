// WelcomeScreen

import { Audio } from './Audio';
import { LOG_CLOSED_LINES, LOG_OPEN_LINES, SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';

export class WelcomeScreen {
    constructor() {
        this.expand = 2;
        Screen.smudge = 26;
    }

    update() {
        // Weird hack here because AudioContext constructor eats up a frame
        // about half the time... I should fix it properly but this hack
        // works for now.
        if (Input.pressed[Input.Action.SELECT] || Audio.initialized) {
            this.closing = true;
        }

        if (this.closing) {
            this.cull = true;
            Screen.smudge = 8;
        }
    }

    draw() {
        let welcome = `                     %gSHADOW OF THE KEENING STAR

%wFor some reason, you just couldn't ignore that letter. It was wrong,
somehow - although estranged, you remember your uncle, and he never
wrote like that.

So here you are, an hour southeast of Boston, still clutching your
uncle's letter and standing in front of a weather-beaten colonial.

The creak of the front door echoes in your ears as you step into the
house...

%d[ENTER] Begin`;

        /*welcome = welcome.split('').map(c => {
            let code = c.charCodeAt(0);
            if (c === 'g' || c === 'w' || c === 'd') return c;
            if (code >= 48 && code <= 122) return String.fromCharCode(code + this.shift);
            return c;
        }).join('');*/

        Screen.clear();
        Screen.writeBox(4, 4, 72, 15, Screen.GREEN);
        Screen.write(6, 5, welcome);
    }
}
