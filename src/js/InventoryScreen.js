// InventoryScreen
//
// The inventory screen has two modes -- if it's passed an object during construction
// then it's actually the "use inventory" screen, if it's not, it's the "examine
// inventory" screen.

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
        if (Input.pressed[Input.Action.BACK]) {
            this.closing = true;
        } else if (Input.pressed[Input.Action.INVENTORY] && !this.object) {
            this.closing = true;
        } else if (Input.pressed[Input.Action.DOWN]) {
            this.selected = (this.selected + 1) % this.list.length;
        } else if (Input.pressed[Input.Action.UP]) {
            this.selected = (this.selected + this.list.length - 1) % this.list.length;
        } else if (Input.pressed[Input.Action.SELECT] && this.object) {
            this.closing = true;
            Game.player.useItemOn(this.object, this.list[this.selected]);
        }

        if (this.closing) {
            this.cull = true;
        }
    }

    draw() {
        Screen.writeBox(5, 6, 71, 10, Screen.GREEN);
        Screen.write(38, 6, '\x97', Screen.GREEN);
        Screen.write(38, 15, '\x98', Screen.GREEN);
        for (let y = 7; y < 15; y++) {
            Screen.write(38, y, '\x90', Screen.GREEN);
        }

        for (let idx = 0; idx < this.list.length; idx++) {
            let [name, description] = World.strings[this.list[idx]];
            if (idx === this.selected) {
                Screen.write(6, 7 + idx, `%0${name.padEnd(30)}%1`, Screen.GREEN);
                Screen.write(40, 7, description);
            } else {
                Screen.write(7, 7 + idx, name);
            }
        }
        if (this.object) {
            Screen.write(6, 14, '[\xa0\xa1\xa2\xa3ENTER] Use item  [ESC] Back', Screen.DIM);
        } else {
            Screen.write(6, 14, '[\xa0\xa1\xa2\xa3] Examine item   [ESC] Back', Screen.DIM);
        }
    }
}
