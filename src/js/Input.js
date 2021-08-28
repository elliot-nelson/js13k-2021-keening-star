// Input

import { Audio } from './Audio';

export const Input = {
    Action: {
        UP:        11,
        DOWN:      12,
        LEFT:      13,
        RIGHT:     14,
        CAST:      15,
        SELECT:    25,
        INVENTORY: 26,
        LOG:       27,
        HELP:      28,
        BACK:      29
    },

    init() {
        // Key action up/down state
        this.keyboard = {};

        // "Pressed" means an input was pressed THIS FRAME.
        this.pressed = {};

        // "Released" means an input was released THIS FRAME.
        this.released = {};

        // "Held" means an input is held down. The input was "Pressed" either
        // this frame or in a past frame, and has not been "Released" yet.
        this.held = {};

        // How many frames was this input held down by the player. If [held]
        // is false, it represents how long the input was last held down.
        this.framesHeld = {};

        this.keyMapping = {
            ArrowUp: Input.Action.UP,
            ArrowLeft: Input.Action.LEFT,
            ArrowDown: Input.Action.DOWN,
            ArrowRight: Input.Action.RIGHT,
            KeyC: Input.Action.CAST,
            KeyL: Input.Action.LOG,
            KeyH: Input.Action.HELP,
            KeyI: Input.Action.INVENTORY,
            Enter: Input.Action.SELECT,
            Escape: Input.Action.BACK
        };

        window.addEventListener('keydown', event => {
            console.log(event);
            let action = this.keyMapping[event.code];
            console.log(action);
            if (action) {
                this.keyboard[action] = true;
            }

            Audio.init();
        });

        window.addEventListener('keyup', event => {
            let action = this.keyMapping[event.code];
            if (action) {
                this.keyboard[action] = false;
            }
        });
    },

    update() {
        for (let action of Object.values(Input.Action)) {
            let held = this.keyboard[action];

            this.pressed[action] = !this.held[action] && held;
            this.released[action] = this.held[action] && !held;

            if (this.pressed[action]) {
                this.framesHeld[action] = 1;
            } else if (this.held[action] && held) {
                this.framesHeld[action]++;
            }

            this.held[action] = held;
        }
    }
};
