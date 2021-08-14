// Player

import { TURN_FRAMES } from './Constants';
import { Input } from './Input';
import { Screen } from './Screen';
import { World } from './World';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };
        this.turn = false;

        this.room = World.roomAt(this.pos);
        this.lookingAt = this.room;
    }

    draw() {
        Screen.writeOnMap(this.pos.x, this.pos.y, '@', Screen.WHITE | Screen.BRIGHT);
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
            console.log(move, World.canMoveInto(move));
            if (World.canMoveInto(move)) {
                this.pos = move;
                this.room = World.roomAt(this.pos);
                this.lookingAt = this.room;
                this.turn = true;
            } else {
                let object = World.objectAt(move);
                if (object) {
                    console.log(object);
                    this.lookingAt = object;
                }
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
