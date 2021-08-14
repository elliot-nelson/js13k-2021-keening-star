// Game
//
// A global object representing the state of the current game in progress. Game owns
// the high-level game loop and orchestrates everything that happens each frame.

import { Camera } from './Camera';
import { FPS, GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { Font } from './Font-gen';
import { Input } from './Input';
import { Player } from './Player';
import { Screen } from './Screen';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { World } from './World';
import { xyz2pos, uni } from './Util';

export const Game = {
    async init() {
        // Initialize game components
        await Font.init();
        Viewport.init();
        Screen.init();
        Text.init();
        Input.init();
        World.init();

        // Initial state values
        this.frame = 0;
        this.entities = [];

        this.player = new Player(xyz2pos(...World.spawn));
        this.entities.push(this.player);

        Camera.init();

        // Kick off game loop
        window.requestAnimationFrame(() => this.onFrame());
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
        Input.update();
        //if (this.frame % 120 === 0) this.player.pos.y--;
        this.player.update();
        Camera.update();
    },

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(Viewport.scale, 0, 0, Viewport.scale, 0, 0);

        // Clear canvas
        Viewport.ctx.fillStyle = '#121212';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Center our ASCII "screen" in the viewport
        Viewport.ctx.translate((Viewport.width - GAME_WIDTH) / 2 | 0, (Viewport.height - GAME_HEIGHT) / 2 | 0);

        Screen.clear();

        //Screen.write(3, 3, 'hello world');

        //Screen.write(0, 0, '/--------------------------------------\\');
        //Screen.write(2, 10, 'You are standing in a cramped drawing room.');

        Screen.write(0, 0, '#');
        Screen.write(79, 0, '#');
        Screen.write(0, 23, '#');
        Screen.write(79, 23, '#');

        //Screen.write(10, 15, uni('║═╬═╬═╬═╬═╬═╬═╬═╬═╬═╬'));

        Screen.raw(40, 10, 'xy\x07]A\x07]BRED');

        for (let i = 0; i < 20; i++) {
            Screen.write(64, i, '#');
        }

        Screen.write(66, 1, 'Health 100/100');
        Screen.write(66, 2, 'Sanity 100/100');
        Screen.write(66, 4, 'Insight   11');
        Screen.write(66, 5, 'Wisdom    11');
        Screen.write(66, 6, 'Fortitude 11');
        Screen.write(66, 6, 'Fortitude 11');
/*
        Screen.write(0, 19, '#'.repeat(60));
        Screen.write(0, 20, 'Here is something.');
        Screen.write(0, 21, 'Here is something.');
        Screen.write(3, 22, 'Here is some kind of something.');
        Screen.write(4, 21, '#'.repeat(60));
        Screen.write(5, 18, '#'.repeat(60));
*/
        World.draw();
        this.player.draw();

        if (this.player.lookingAt) {
            Screen.write(0, 20, World.strings[this.player.lookingAt.name]);
        }

        Screen.draw(Viewport.ctx);

        //Sprite.drawSprite(Viewport.ctx, Sprite.font, 0, 0);
    }
};
