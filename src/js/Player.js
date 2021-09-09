// Player

import { CombatSystem } from './CombatSystem';
import {
    TURN_FRAMES,
    TYPE_DOOR
} from './Constants';
import { Game } from './Game';
import { Input } from './Input';
import { InventoryScreen } from './InventoryScreen';
import { Log } from './Log';
import { Screen } from './Screen';
import { World } from './World';
import {
    $D_DINING,
    $D_DINING_OPEN,
    $D_DRAW,
    $D_FOYER,
    $D_GARAGE,
    $D_KITCHEN,
    $D_HALLWAY,
    $F_BURNT_CHAIR,
    $F_BURNT_CHAIR_A,
    $F_BURNT_CHAIR_B,
    $F_FIRE3,
    $F_FIRE3_A,
    $F_FIRE3_B,
    $F_SHELF1,
    $F_STAIR1,
    $F_STATUE,
    $F_STATUE_A,
    $F_STATUE_B,
    $I_BURNT_NOTEBOOK,
    $I_IRON_KNIFE,
    $I_SILVER_KEY,
    $I_UNCLE_LETTER,
    $R_DRAW,
    $R_DINING,
    $R_GARAGE,
    $R_HALLWAY
} from './WorldData-gen';
import { WorldParticle } from './WorldParticle';

export class Player {
    constructor(pos) {
        this.pos = { ...pos };

        this.lookingAt = this.room;
        this.inventory = [];


        this.speed = 4;
        this.hp = this.hpMax = 100;
        this.sp = this.spMax = 100;

        // *COMBAT*
        // this.vigor = 8;
        // this.insight = 12;
        // this.will = 10;
        // this.updateStats();
        // this.weapon = { ar: 0.5 };
        // this.df = flood(this.pos);

        // The player starts with the uncle's letter.
        this.obtainItem($I_UNCLE_LETTER);

        // The foyer door is locked.
        World.objectsById($D_FOYER, object => object.finished = true);

        // The player is in the foyer (starting room).
        this.room = World.roomAt(this.pos);
        Log.add(World.strings[this.room.id][1]);
        World.makeVisible(this.room.id);

        // Temporary hack stuff
        this.obtainItem($I_IRON_KNIFE);
        this.obtainItem($I_BURNT_NOTEBOOK);

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
            // *COMBAT*
            // this.attack(entity);
        } else if (object) {
            if (object.open) {
                this.moveInto(pos, false);
            } else if (object.finished) {
                this.lookingAt = object;
                Log.add(World.strings[object.id]);
                console.log('finished' + World.strings[object.id]);
            } else {
                /**** SPECIAL OBJECTS ****/
                if (object.id === $D_DINING) {
                    Log.add(World.strings[object.id]);
                    if (object.interacted) {
                        this.openInventoryFor(object);
                    }
                } else if (object.id === $D_DRAW) {
                    this.openDoor(object);
                    World.makeVisible($R_DRAW);
                } else if (object.id === $D_KITCHEN) {
                    Log.add(World.strings[object.id]);
                } else if (object.id === $D_GARAGE) {
                    this.openDoor(object);
                    World.makeVisible($R_GARAGE);
                } else if (object.id === $D_HALLWAY) {
                    this.openDoor(object);
                    World.makeVisible($R_HALLWAY);
                } else if (object.id === $F_BURNT_CHAIR) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_BURNT_CHAIR_A;
                } else if (object.id === $F_BURNT_CHAIR_A) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_BURNT_CHAIR_B;
                    object.finished = true;
                    this.obtainItem($I_BURNT_NOTEBOOK);
                } else if (object.id === $F_FIRE3) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_FIRE3_A;
                } else if (object.id === $F_FIRE3_A) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_FIRE3_B;
                    this.obtainItem($I_IRON_KNIFE);
                } else if (object.id === $F_SHELF1) {
                    Log.add(World.strings[object.id])
                    object.finished = true;
                    this.obtainItem($I_SILVER_KEY);
                } else if (object.id === $F_STATUE) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_STATUE_A;
                } else if (object.id === $F_STATUE_A) {
                    Log.add(World.strings[object.id]);
                    object.id = $F_STATUE_B;
                    object.finished = true;
                    this.obtainItem($I_IRON_KNIFE);
                } else if (object.id === $F_STAIR1) {
                    Log.add(World.strings[object.id])
                    object.finished = true;
                } else if (object.type === TYPE_DOOR) {
                    this.openDoor(object);
                } else {
                    let action = '';
                    if (object.action) {
                        action = `\n${object.action}`;
                    } else if (object.interacted) {
                        action = `\n%y\xa5 You need some kind of other item.`;
                    }
                    this.lookingAt = object;
                    console.log(object.id);
                    console.log(World.strings[object.id] + action);
                    Log.add(World.strings[object.id] + action);
                    console.log('else statement' + World.strings[object.id]);
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
                Log.add(World.strings[room.id][1]);
            }
            this.room = room;
            this.lookingAt = this.room;
        }
    }

    openInventoryFor(object) {
        Game.screens.push(new InventoryScreen(object));
    }

    useItemOn(object, item) {
        if (object.id === $D_DINING) {
            if (item === $I_IRON_KNIFE) {
                this.openDoor(object, $D_DINING_OPEN);
                World.makeVisible($R_DINING);
            } else {
                Log.add(`That doesn't work here.`, '%y');
            }
        }
        console.log('oh fuck, i am using ' + object + item);
    }

    hasItem(id) {
        return this.inventory.includes(id);
    }

    obtainItem(id) {
        this.inventory.push(id);
    }

    openDoor(object, stringId) {
        if (stringId) {
            Log.add(World.strings[stringId]);
        } else {
            Log.add('You push the door open.', '%y');
        }
        object.open = object.finished = true;
        object.char = object.char === '|' ? `'` : '\x7f';
    }

    // *COMBAT*
    /*
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
    */
}
