// base64
//
// This optional module decodes cartridge data from base64 to hex.
//
// Usage:
//
//   const { AudioCart } = import 'p8-audio-player';
//   const { decode } = import 'p8-audio-player/base64';
//
//   new AudioCart(decode(cartData))

const decodeLine = encoded => [...atob(encoded)].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
const decodeSection = encoded => encoded.split('\n').map(decodeLine).join('\n');

export function decode({ sfx, music }) {
    return {
        sfx: decodeSection(sfx),
        music: decodeSection(music)
    };
}
