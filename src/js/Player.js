// Player

import { TURN_FRAMES } from './Constants';
import { Input } from './Input';
import { Screen } from './Screen';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
    }

    draw() {
        Screen.writeOnMap(this.pos.x, this.pos.y, '@');
    }

    update() {
        if (Input.held[Input.Action.LEFT] && Input.framesHeld[Input.Action.LEFT] % TURN_FRAMES === 1) {
            this.pos.x--;
        } else if (Input.held[Input.Action.RIGHT] && Input.framesHeld[Input.Action.RIGHT] % TURN_FRAMES === 1) {
            this.pos.x++;
        } else if (Input.held[Input.Action.UP] && Input.framesHeld[Input.Action.UP] % TURN_FRAMES === 1) {
            this.pos.y--;
        } else if (Input.held[Input.Action.DOWN] && Input.framesHeld[Input.Action.DOWN] % TURN_FRAMES === 1) {
            this.pos.y++;
        }
        /*
        if (Input.held[Input.Action.LEFT])
        if (Input.held[Input.Action.LEFT]) {
            this.pos.x--;
            console.log(['held left', Input.framesHeld[Input.Action.LEFT]]);
        } else if (Input.pressed[Input.Action.UP]) {
            this.pos.y--;
        }*/
    }
}
