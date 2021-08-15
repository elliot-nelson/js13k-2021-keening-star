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
        this.lastAction = undefined;
        this.inventory = [];
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
            this.turn = true;
            this.lastAction = undefined;
            this.interactWith(move);
        }
    }

    interactWith(pos) {
        let tile = World.tileAt(pos);
        let object = World.objectAt(pos);

        if (object) {
            if (object.open) {
                this.moveInto(pos, false);
            } else if (object.finished) {
                this.lookingAt = object;
            } else {
                switch (object.name) {
                    case 'DDRAW':
                        this.lastAction = 'You push the door open.';
                        object.open = object.finished = true;
                        object.char = `'`;
                        break;
                    default:
                        this.lookingAt = object;
                        break;
                }
            }
        } else if (tile === World.FLOOR) {
            this.moveInto(pos, true);
        } else {
            console.log('No.');
        }
    }

    moveInto(pos, updateRoom) {
        this.pos = pos;
        if (updateRoom) {
            // This is a cheap, easy way to make doors part of "both rooms" - when you step
            // between rooms, the current room description doesn't update until you walk
            // past the doorway.
            this.room = World.roomAt(this.pos);
            this.lookingAt = this.room;
        }
    }
}
