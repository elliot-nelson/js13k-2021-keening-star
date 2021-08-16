// Triggers
//
// In this game, a "trigger" is responsible for spawning objects or enemies, usually
// when the player enters a specific area of the world. The trigger contains the
// list of objects and object locations to spawn.
//
// A trigger is inert until it is "armed", which is what allows us to set up chains
// of events (e.g., maybe the player entering the drawing room should spawn an enemy,
// but not until after they've obtained a certain artifact).

import { Game } from './Game';
import { World } from './World';
import { Rat } from './enemy/Rat';

export const Triggers = {
    update() {
        for (let z = 0; z < World.floors.length; z++) {
            for (let trigger of World.floors[z].triggers) {
                if (trigger.armed && !trigger.fired) {
                    this.fire(trigger, z);
                }
            }
        }
    },

    arm(name, reset = false) {
        for (let floor of World.floors) {
            for (let trigger of floor.triggers) {
                if (trigger.name === name) {
                    trigger.armed = true;
                    if (reset) trigger.fired = false;
                }
            }
        }
    },

    fire(trigger, z) {
        trigger.fired = true;
        for (let object of trigger.objects) {
            this.spawn(object, z);
        }
    },

    spawn(object, z) {
        switch (object.name) {
            case 'RAT':
                Game.entities.push(new Rat({ x: object.x, y: object.y, z }));
                break;
            default:
                console.log('no');
        }
    }
};
