// Game
//
// A global object representing the state of the current game in progress. Game owns
// the high-level game loop and orchestrates everything that happens each frame.

import { FPS, GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { Viewport } from './Viewport';
import { Screen } from './Screen';
import { Sprite } from './Sprite';
import { World } from './World-gen';

export const Game = {
    init() {
        // Initialize game components
        Sprite.loadSpriteSheet(() => {
            Viewport.init();
            Screen.init();
            Sprite.init();

            // Initial state values
            this.frame = 0;

            // Kick off game loop
            window.requestAnimationFrame(() => this.onFrame());
        });
    },

    onFrame() {
        let now = new Date().getTime();
        let lastFrame = this.lastFrame || 0;

        // Note: `requestAnimationFrame` will usually call our handler 60 times per second,
        // but it can be higher or lower (lower if the game is lagging, higher if the user's
        // refresh settings are modified -- it can be 120Hz for example).
        //
        // It's safest to explicitly limit the number of frame updates to 60 per second.
        if (now - lastFrame >= 1000 / FPS) {
            this.frame++;
            this.update();
            this.lastFrame = now;

            Viewport.resize();
            this.draw();
        }

        window.requestAnimationFrame(() => this.onFrame());
    },

    update() {

    },

    draw() {
        console.log(1);
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

        // Clear canvas
        Viewport.ctx.fillStyle = '#121212';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Center our ASCII "screen" in the viewport
        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        Screen.write(3, 3, 'hello world');

        Screen.draw(Viewport.ctx);
    }
};
