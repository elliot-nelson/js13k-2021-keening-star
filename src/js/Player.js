// Player

import { TURN_FRAMES } from './Constants';
import { Input } from './Input';
import { Screen } from './Screen';
import { canMoveInto } from './Util';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.turn = false;
    }

    draw() {
        Screen.writeOnMap(this.pos.x, this.pos.y, '@');
    }

    update() {
        this.turn = false;

        let move;

        console.log(Input.held[Input.Action.LEFT], Input.framesHeld[Input.Action.LEFT]);
        if (Input.held[Input.Action.LEFT] && Input.framesHeld[Input.Action.LEFT] % TURN_FRAMES === 1) {
            move = { ...this.pos, x: this.pos.x - 1 };
        } else if (Input.held[Input.Action.RIGHT] && Input.framesHeld[Input.Action.RIGHT] % TURN_FRAMES === 1) {
            move = { ...this.pos, x: this.pos.x + 1 };
        } else if (Input.held[Input.Action.UP] && Input.framesHeld[Input.Action.UP] % TURN_FRAMES === 1) {
            move = { ...this.pos, y: this.pos.y - 1 };
        } else if (Input.held[Input.Action.DOWN] && Input.framesHeld[Input.Action.DOWN] % TURN_FRAMES === 1) {
            move = { ...this.pos, y: this.pos.y + 1 };
        }

        if (move) {
            console.log(move, canMoveInto(move));
            if (canMoveInto(move)) {
                this.pos = move;
                this.turn = true;
            }
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
