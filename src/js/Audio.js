// Audio

//import { AudioCart } from 'pico8-audio-player';
import { AudioCart } from '../../temp-pico8-music';
import { AudioData } from './AudioData-gen';

export const Audio = {
    init() {
        if (this.initialized) return;

        // Note: unlike most init() methods, this is called from the first
        // user-triggered event (like a keypress), not the main game loop. This
        // avoids warnings in browsers about being unable to create an AudioContext.
        this.initialized = true;
        this.audioCtx = new AudioContext();

        this.globalGain = new GainNode(this.audioCtx, { gain: 0 });
        this.globalGain.connect(this.audioCtx.destination);

        this.cart = new AudioCart(AudioData, { audioCtx: this.audioCtx });

        this.music = this.cart.music();
        this.music.connect(this.globalGain);
        this.music.start();
    }
};
