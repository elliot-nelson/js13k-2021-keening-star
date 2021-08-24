// HelpScreen

import { LOG_CLOSED_LINES, LOG_OPEN_LINES, SCREEN_WIDTH, SCREEN_HEIGHT } from './Constants';
import { Input } from './Input';
import { Log } from './Log';
import { Screen } from './Screen';

export class HelpScreen {
    constructor() {
        this.expand = 2;
    }

    update() {
        if (Input.pressed[Input.Action.BACK] || Input.pressed[Input.Action.HELP]) {
            this.closing = true;
        }

        if (this.closing) {
            this.expand -= 2;
            if (this.expand === 2) {
                this.cull = true;
                return;
            }
        } else {
            if (this.expand < 22) this.expand += 2;
        }
    }

    draw() {
        const help = `                                  %gHELP

%gCONTROLS
  %W\xa0\xa1\xa2\xa3    %wMove / Investigate / Attack
  %WI       %wOpen inventory
  %WL       %wExpand logbook
  %WH       %wToggle help (this screen)

%gMAP LEGEND
  %W@       %wYou
  %d.       %wEmpty floors
  %w\x80\x81      %wWalls
  %b|- %d'    %wDoors (%bclosed%w / %dopen%w)
  %b< >     %wStairways (up / down)

  %b&!      %wBlue objects can be investigated
  %y%#      %wYellow objects may need to be revisited later
  %d=$      %wGray objects have already been investigated

  %rsfVH    %wRed letters are foes`;

        Screen.writeBox(2, 12 - Math.floor(this.expand / 2), 76, this.expand, Screen.GREEN);
        Screen.write(4, 13 - Math.floor(this.expand / 2), help.split('\n').slice(0, this.expand).join('\n'));
    }
}
