// WelcomeScreen

import { Audio } from './Audio';
import { LOG_CLOSED_LINES, LOG_OPEN_LINES, SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';

export class GoodbyeScreen {
    constructor() {
        Screen.smudge = 7;
    }

    update() {
    }

    draw() {
        let goodbye = `                     %gSHADOW OF THE KEENING STAR

%wYour uncle forgotten for now, you scrabble into the newly-opened
hole in the floor. Your mind is singing with a clarity you have
never felt before as you go to meet your Goddess for the first time.

You have a feeling this is only the beginning...




                             %d(THE END)`;

        Screen.clear();
        Screen.writeBox(4, 4, 72, 15, Screen.GREEN);
        Screen.write(6, 5, goodbye);
    }
}
