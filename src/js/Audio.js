// Audio

//import { AudioCart } from 'pico8-audio-player';
import { AudioCart } from '../../temp-pico8-music';
import { AudioData } from './AudioData-gen';
import { Input } from './Input';

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
            this.globalGain.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 2);

            this.cart = new AudioCart(AudioData, { audioCtx: this.audioCtx });

            this.music = this.cart.music();
            this.music.connect(this.globalGain);
            this.music.start();
        }, 1);
    }
};
