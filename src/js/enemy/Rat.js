// Enemy - Rat

import { Camera } from '../Camera';
import { Game } from '../Game';
import { Screen } from '../Screen';

export class Rat {
    constructor(pos) {
        this.pos = { ...pos };
        this.hp = 5;
    }

    update() {

    }

    draw() {
        if (this.pos.z === Camera.pos.z) Screen.writeOnMap(this.pos.x, this.pos.y, 'r', Screen.RED);
    }
}
