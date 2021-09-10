// WorldParticle
//
// A world particle is a particle that animates "on the map" (that is,
// it's X/Y/Z coordinates are in the context of the world, and move with
// the camera).

import { Camera } from './Camera';
import { Screen } from './Screen';
/*
export class WorldParticle {
    constructor(pos, frames) {
        this.pos = { ...pos };
        this.frames = frames;
        this.text = this.frames.shift();
        this.z = 1;
    }

    update() {
        this.text = this.frames.shift();

        if (!this.text) this.cull = true;
    }

    draw() {
        if (this.pos.z === Camera.pos.z && !this.cull) Screen.writeOnMap(this.pos.x, this.pos.y, ...this.text);
    }
}
*/
