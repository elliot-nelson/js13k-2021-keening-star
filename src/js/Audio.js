// Audio

//import { AudioCart } from 'pico8-audio-player';
//import { AudioCart } from '../../temp-pico8-music';
import { AudioCart } from './pico8-audio-player';
import { AudioData } from './AudioData-gen';

export const Audio = {
    init() {
        if (this.initialized) return;

        // Note: unlike most init() methods, this is called from the first
        // user-triggered event (like a keypress), not the main game loop. This
        // avoids warnings in browsers about being unable to create an AudioContext.
        this.initialized = true;

        const AC = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AC();

        setTimeout(() => {
            this.globalGain = this.audioCtx.createGain(this.audioCtx, { gain: 0 });
            this.globalGain.connect(this.audioCtx.destination);
            this.unmute(3);

            this.cart = new AudioCart(AudioData, { audioCtx: this.audioCtx });

            this.music = this.cart.music();
            this.music.connect(this.globalGain);
            this.music.start();
        }, 1);
    },

    mute(seconds = 1) {
        this.globalGain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + seconds);
    },

    unmute(seconds = 1) {
        this.globalGain.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + seconds);
    }

    // If I supported sound effects, I'd list them here.
    // Due to lack of space, not yet implemented :)
    //
    /*playStuff() {
        let sfx = this.cart.sfx(2);
        sfx.connect(this.globalGain);
        sfx.start();
    }
    */
};
