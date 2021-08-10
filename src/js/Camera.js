// Camera

import { Game } from './Game';

export const Camera = {
    init() {
        this.pos = { x: 0, y: 0, z: 0 };
    },

    update() {
        this.pos = Game.player.pos;
    }
};
