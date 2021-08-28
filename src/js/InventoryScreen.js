// InventoryScreen

import { LOG_CLOSED_LINES, LOG_OPEN_LINES, SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
import { Game } from './Game';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';
import { World } from './World';

export class InventoryScreen {
    constructor(object) {
        this.object = object;
        this.expand = 2;
        this.selected = 0;
        this.list = Game.player.inventory;
    }

    update() {
        console.log(['update', Input.pressed[Input.Action.DOWN]]);
        if (Input.pressed[Input.Action.BACK]) {
            this.closing = true;
        } else if (Input.pressed[Input.Action.DOWN]) {
            this.selected = (this.selected + 1) % this.list.length;
        } else if (Input.pressed[Input.Action.UP]) {
            this.selected = (this.selected + this.list.length - 1) % this.list.length;
        } else if (Input.pressed[Input.Action.SELECT]) {
            this.closing = true;
            Game.player.useItemOn(this.object, this.list[this.selected]);
        }

        if (this.closing) {
            this.cull = true;
        }
    }

    draw() {
        Screen.writeBox(10, 6, 40, 10, Screen.GREEN);

        for (let idx = 0; idx < this.list.length; idx++) {
            let description = World.strings[this.list[idx]][0];
            if (idx === this.selected) {
                Screen.write(12, 7 + idx, `%0${description.padEnd(34)}%1`, Screen.GREEN);
            } else {
                Screen.write(13, 7 + idx, description);
            }
        }
        Screen.write(13, 14, '[\xa0\xa1\xa2\xa3ENTER] Use item    [ESC] Back', Screen.DIM);
    }
}
