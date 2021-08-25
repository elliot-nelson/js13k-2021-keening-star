// Player

import { CombatSystem } from './CombatSystem';
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
        this.inventory = {};

        this.df = flood(this.pos);

        this.vigor = 8;
        this.insight = 12;
        this.will = 10;
        this.speed = 12;
        this.hp = this.hpMax = 100;
        this.sp = this.spMax = 100;
        this.updateStats();

        this.weapon = { ar: 0.5 };

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
            this.attack(entity);
        } else if (object) {
            if (object.open) {
                this.moveInto(pos, false);
            } else if (object.finished) {
                this.lookingAt = object;
                Log.add(World.strings[object.name]);
                console.log('finished' + World.strings[object.name]);
            } else {
                if (object.name === '$DDINING') {
                    if (Game.player.inventory.$IRON_KNIFE)
                        Log.add(World.strings.$DDINING_OPEN);
                } else if (object.name === '$FFIRE3') {
                    Log.add(World.strings[object.name]);
                    object.name = '$FFIRE3_A';
                } else if (object.name === '$FFIRE3_A') {
                    Log.add(World.strings[object.name]);
                    object.name = '$FFIRE3_B';
                    Game.player.inventory.$IRON_KNIFE = true;
                } else if (object.name[0] === 'D') {
                    console.log('adding door push');
                    Log.add('You push the door open.', '%y');
                    object.open = object.finished = true;
                    object.char = `'`;
                } else {
                    let action = '';
                    if (object.action) {
                        action = `\n${object.action}`;
                    } else if (object.interacted) {
                        action = `\n%y\xa5 You need some kind of other item.`;
                    }
                    this.lookingAt = object;
                    console.log(object.name);
                    console.log(World.strings[object.name] + action);
                    Log.add(World.strings[object.name] + action);
                    console.log('else statement' + World.strings[object.name]);
                }
            }

            object.interacted = true;
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

    attack(entity) {
        let roll = CombatSystem.rollAttack(this.vigor, this.weapon.ar);
        if (roll.result === CombatSystem.WHIFF) {
            Log.add('%YYou slash at the swamp rat, but miss.');
        } else if (roll.result === CombatSystem.HIT) {
            Log.add(`%YYou slash the ${CombatSystem.formatActeeName(entity)}, dealing ${roll.value} damage.`);
        } else if (roll.result === CombatSystem.CRIT) {
            Log.add(`%YFocus! You slash the ${CombatSystem.formatActeeName(entity)}, dealing ${roll.value} damage.`);
        }
        Game.entities.push(new WorldParticle(entity.pos, [['/', Screen.YELLOW], ['*', Screen.YELLOW]]));
        Game.entities.push(new WorldParticle(Game.player.pos, [['@', Screen.YELLOW]]));
    }

    updateStats() {
        this.lvl = this.vigor + this.insight + this.will;

        let hpMax = this.vigor * 10 + this.lvl - 10;

        if (hpMax > this.hpMax) {
            this.hpMax = hpMax;
            this.hp += (hpMax - this.hpMax);
        }

        let spMax = this.will * 10 + this.lvl - 30;

        if (spMax > this.spMax) {
            this.spMax = spMax;
            this.sp += (spMax - this.spMax);
        }
    }
}
