// Player

import { TURN_FRAMES } from './Constants';
import { Game } from './Game';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';
import { World } from './World';
import { WorldParticle } from './WorldParticle';
import { flood } from './Util';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };

        this.room = World.roomAt(this.pos);
        this.lookingAt = this.room;
        this.inventory = [];

        this.df = flood(this.pos);

        this.speed = 12;

        Log.add(World.strings[this.room.name]);
    }

    draw() {
        Screen.writeOnMap(this.pos.x, this.pos.y, '@', Screen.WHITE | Screen.BRIGHT);
    }

    update() {
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
            this.interactWith(move);
        }
        return !!move;
    }

    interactWith(pos) {
        let tile = World.tileAt(pos);
        let object = World.objectAt(pos);
        let entity = Game.entityAt(pos);

        if (entity) {
            console.log('ATTACK THE ENTITY!');
            Game.entities.push(new WorldParticle(pos, [['/', Screen.YELLOW], ['*', Screen.YELLOW]]));
            Game.entities.push(new WorldParticle(Game.player.pos, [['@', Screen.YELLOW]]));
        } else if (object) {
            object.interacted = true;

            if (object.open) {
                this.moveInto(pos, false);
            } else if (object.finished) {
                this.lookingAt = object;
                Log.add(World.strings[object.name]);
                console.log('what' + World.strings[object.name]);
            } else {
                switch (object.name) {
                    case 'DDRAW':
                        Log.add('You push the door open.');
                        object.open = object.finished = true;
                        object.char = `'`;
                        break;
                    default:
                        this.lookingAt = object;
                        Log.add(World.strings[object.name]);
                        console.log('what' + World.strings[object.name]);
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
        this.df = flood(this.pos);
        if (updateRoom) {
            // This is a cheap, easy way to make doors part of "both rooms" - when you step
            // between rooms, the current room description doesn't update until you walk
            // past the doorway.
            let room = World.roomAt(this.pos);
            if (this.room !== room) {
                Log.add(World.strings[room.name]);
            }
            this.room = room;
            this.lookingAt = this.room;
            this.lastAction = undefined;
        }
    }
}
