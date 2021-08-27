// Game
//
// A global object representing the state of the current game in progress. Game owns
// the high-level game loop and orchestrates everything that happens each frame.

import { Camera } from './Camera';
import { FPS, GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { Font } from './Font-gen';
import { Input } from './Input';
import { Log } from './Log';
import { LogScreen } from './LogScreen';
import { HelpScreen } from './HelpScreen';
import { InventoryScreen } from './InventoryScreen';
import { Player } from './Player';
import { Screen } from './Screen';
import { Text } from './Text';
import { Triggers } from './Triggers';
import { TurnSystem } from './TurnSystem';
import { Viewport } from './Viewport';
import { World } from './World';
import { xyz2pos, formatStat, formatQuantity } from './Util';

export const Game = {
    async init() {
        // Initialize game components
        await Font.init();
        Viewport.init();
        Screen.init();
        Text.init();
        Input.init();
        World.init();
        Log.init();

        // Initial state values
        this.frame = 0;
        this.entities = [];

        this.player = new Player(xyz2pos(...World.spawn));
        this.entities.push(this.player);

        this.screens = [];

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

        //Triggers.arm('TRAT1');
    },

    update() {
        Input.update();

        //console.log([Input.pressed[Input.Action.LOG],Input.Action.LOG,Input.held[Input.Action.LOG]]);
        if (this.screens.length > 0) {
            this.screens[this.screens.length - 1].update();
            this.screens = this.screens.filter(screen => !screen.cull);
        } else if (Input.pressed[Input.Action.LOG]) {
            //console.log('MAKING A NEW SCREEN');
            this.screens.push(new LogScreen());
        } else if (Input.pressed[Input.Action.HELP]) {
            //console.log('help screen');
            this.screens.push(new HelpScreen());
        } else if (Input.pressed[Input.Action.INVENTORY]) {
            this.screens.push(new InventoryScreen());
            console.log('inv');
        } else {
            TurnSystem.takeEntityTurns();
        }

        Camera.update();

        Triggers.update();

        // Discard any entites marked for culling at the end of the update step. They will not
        // be drawn this frame (so, setting "cull" should happen AFTER the last frame of a given
        // enemy or particle has been drawn).
        Game.entities = Game.entities.filter(entity => !entity.cull);
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

        for (let i = 0; i < 20; i++) {
            Screen.write(64, i, '\x90', Screen.DIM);
        }

        Screen.writeBox(0, 19, 80, 5, Screen.DIM);
        Screen.write(64, 19, '\x98', Screen.DIM);
        //Screen.write(0, 19, '\x91'.repeat(80));

        Screen.write(66, 1, `Health ${formatQuantity(Game.player.hp)}/${formatQuantity(Game.player.hpMax)}`);
        Screen.write(66, 2, `Sanity ${formatQuantity(Game.player.sp)}/${formatQuantity(Game.player.spMax)}`);

        Screen.write(66, 4, `Vigor   ${formatStat(Game.player.vigor)}`);
        Screen.write(66, 5, `Insight ${formatStat(Game.player.insight)}`);
        Screen.write(66, 6, `Will    ${formatStat(Game.player.will)}`);
        Screen.write(66, 7, `Speed   ${formatStat(Game.player.speed)}`);

        Screen.write(66, 18, '[H] Help', Screen.DIM);
/*
        Screen.write(0, 19, '#'.repeat(60));
        Screen.write(0, 20, 'Here is something.');
        Screen.write(0, 21, 'Here is something.');
        Screen.write(3, 22, 'Here is some kind of something.');
        Screen.write(4, 21, '#'.repeat(60));
        Screen.write(5, 18, '#'.repeat(60));
*/
        World.draw();

        // A simplistic 3-layer z-order system. We can always be more advanced
        // and actually sort by z later!
        for (let entity of this.entities) {
            if (entity.z < 0) entity.draw();
        }
        for (let entity of this.entities) {
            if (!entity.z) entity.draw();
        }
        for (let entity of this.entities) {
            if (entity.z > 0) entity.draw();
        }

        Log.draw(3);

        for (let screen of this.screens) {
            screen.draw();
        }

        Screen.draw(Viewport.ctx);
    },

    entityAt(pos) {
        return this.entities.find(entity => {
            let found = (entity.pos.x === pos.x) && (entity.pos.y === pos.y) && (entity.pos.z === pos.z);
            return found;
        });
    },
};
