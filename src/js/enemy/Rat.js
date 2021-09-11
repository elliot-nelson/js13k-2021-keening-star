// Enemy - Rat

import { Camera } from '../Camera';
import { Game } from '../Game';
import { Log } from '../Log';
import { Screen } from '../Screen';
import { World } from '../World';

/*
export class Rat {
    constructor(pos) {
        this.actorName = 'swamp rat';

        this.pos = { ...pos };
        this.hp = 5;
        this.speed = 12;

        Log.add(`${Screen.FORMAT_RED}A foul-smelling swamp rat emerges from the shadows.`);
    }

    update() {
        let options = [
            { ...this.pos, x: this.pos.x + 1 },
            { ...this.pos, x: this.pos.x - 1 },
            { ...this.pos, y: this.pos.y - 1 },
            { ...this.pos, y: this.pos.y + 1 }
        ];
        for (let option of options) {
            option.score = Game.player.df[option.z][option.y][option.x];
        }
        options.sort((a, b) => a.score - b.score);

        if (options[0].cost !== Infinity) {
            this.interactWith({ x: options[0].x, y: options[0].y, z: options[0].z });
        }
    }

    interactWith(pos) {
        let tile = World.tileAt(pos);
        let object = World.objectAt(pos);
        let entity = Game.entityAt(pos);
        //console.log('Rat is taking a turn');
        //console.log({
            'from': this.pos,
            'to': pos,
            'player': Game.player.pos,
            'entity': Game.entityAt(pos)
        });

        if (entity === Game.player) {
            //console.log('ATTACK!');
        } else if (tile === World.FLOOR) {
            this.pos = pos;
        } else {
            //console.log('Rat says no.');
        }
    }

    draw() {
        if (this.pos.z === Camera.pos.z) Screen.writeOnMap(this.pos.x, this.pos.y, 'r', Screen.RED);
    }
}
*/
