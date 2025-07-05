import { _key_prev_state, _key_state } from '/imports/input.js';
import { playingSounds } from '/imports/assets.js'
import { ctx } from '/imports/canvasSetup.js';

let currentDrawColor = null;
let currentFontName = null;

/**
 * With this function you can play any sound asset in your game. You provide the sound asset and assign it a priority, which is then used to determine how sounds are dealt with when the number of sounds playing is over the limit set by the function audio_channel_num(). Lower priority sounds will be stopped in favour of higher priority sounds, and the priority value can be any real number (the actual value is arbitrary, and can be from 0 to 1 or 0 to 100, as GameMaker will prioritize them the same). The higher the number the higher the priority, so a sound with priority 100 will be favoured over a sound with priority 1. The third argument is for making the sound loop and setting it to true will make the sound repeat until it's stopped manually, and setting it to false will play the sound once only.
 * 
 * @param {object} index The index of the sound to play.
 * @param {number} priority Set the channel priority for the sound.
 * @param {boolean} loop Sets the sound to loop or not.
 * @param {number} gain [OPTIONAL] Value for the gain.
 * @param {number} offset [OPTIONAL] The time (in seconds) to set the start point to. Values longer than the length of the given sound are ignored.
 * @param {number} pitch [OPTIONAL] The pitch multiplier (default 1).
 * 
 * @returns {void}
 */
function audio_play_sound(index, priority, loop, gain = 1, offset = 0, pitch = 1) {
  if (!index) return;
  if (!loop && playingSounds.has(index)) {
    playingSounds.get(index).stop();
  }
  index.loop(loop);
  index.volume(gain);

  index.play();
  playingSounds.set(index, index);
}
/**
 * This function can be used to change the pitch of a given sound. The sound can either be one referenced from an index for an individual sound being played which has been stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions, or an actual sound asset from the Asset Browser. If it is an index of a playing sound, then only that instance will be changed, however when using a sound asset from the Asset Browser, all instances of that sound asset being played will be changed. The pitch argument is a pitch multiplier, in that the input value multiplies the current pitch by that amount, so the default value of 1 is no pitch change, while a value of less than 1 will lower the pitch and greater than 1 will raise the pitch. It is best to use small increments for this function as any value under 0 or over 5 may not be audible anyway. It is worth noting that the total pitch change permitted is clamped to (1/256) - 256 octaves, so any value over or under this will not be registered.
 * 
 * @param {string} index The index of the sound to change.
 * @param {number} pitch The pitch multiplier (default 1).
 */
function audio_sound_pitch(index, pitch) {
  if (index instanceof Howl) {
    index.rate(pitch)
  }
}

function audio_sound_gain(index, volume, time) {
  console.log("TODO: finish");
}

/**
 * This function will check the given sound to see if it is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be checked and if any of them are playing the function will return true otherwise it will return false. Note that this function will still return true if the sound being checked has previously been paused using the audio_pause_sound() function.
 * 
 * @param {object} index The index of the sound to check.
 * 
 * @returns {boolean}
 */
function audio_is_playing(index) {
  return index ? index.playing() : false
}

/**
 * This function will stop ALL sounds that are currently playing
 * 
 * @returns {void}
 */
function audio_stop_all(){
  Howler.stop();
  playingSounds.clear();
}

/** 
 * This function will get the font currently assigned for drawing text. The function will return -1 if no font is set, or the name of the font assigned.
 * 
 * @returns {string | -1} The font name, or -1 if none.
 */
function draw_get_font() {
  if (currentFontName === null) return -1;
  return currentFontName;
}

/**
 * With this function you can set the base draw colour for the game. This will affect drawing of fonts, forms, primitives and 3D, however it will not affect sprites (drawn manually or by an instance). If any affected graphics are drawn with their own colour values, this value will be ignored.
 * 
 * @param {string} colour - The colour to set for drawing.
 * @returns {void}
 */
function draw_set_color(col) {
  currentDrawColor = col;
}

/**
 * With this function you can draw any string at any position within the room. To combine strings you can use + and you can also use \n within a string to add a line break so it is drawn over multiple lines.
 * 
 * @param {number} x The x coordinate of the drawn string.
 * @param {number} y The y coordinate of the drawn string.
 * @param {string} string The string to draw.
 * @returns {void}
 */
function draw_text(x, y, string) {
  ctx.fillStyle =  currentDrawColor;
  ctx.fillText(string, x, y);
}

/**
 * This function will draw text in a similar way to draw_text() only now you can choose to scale the text along the horizontal or vertical axis (effectively stretching or shrinking it) and also have it be drawn at an angle (where 0 is normal and every degree over 0 rotates the text anti-clockwise).
 * 
 * @param {number} x The x coordinate of the drawn string.
 * @param {number} y The y coordinate of the drawn string.
 * @param {string} string The string to draw.
 * @param {number} xscale The horizontal scale (default 1).
 * @param {number} yscale The vertical scale(default 1).
 * @param {number} angle The angle of the text.
 * @returns {void}
 */
function draw_text_transformed(x, y, string, xscale, yscale, angle) {
  ctx.fillStyle =  currentDrawColor;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.scale(xscale, yscale);
  ctx.fillText(string, 0, 0);
  ctx.restore();
}

/** 
 * With this function you can check to see if a key has been pressed or not. Unlike the keyboard_check() function, this function will only run once for every time the key is pressed down, so for it to trigger again, the key must be first released and then pressed again. The function will take a keycode value as returned by any of the vk_* constants listed far above.
 * 
 * @param {string} key The key to check the pressed state of.
 * 
 * @returns {boolean}
 */
function keyboard_check_pressed(key) {
  return !!_key_state[key] && !_key_prev_state[key];
}

/** 
 * With this function you can check to see if a key is held down or not. The function will take a keycode value as returned by the function ord (only capital letters from A-Z or numbers from 0-9), or any of the vk_* constants listed far above. Unlike the keyboard_check_pressed or keyboard_check_released functions which are only triggered once when the key is pressed or released, this function is triggered every step that the key is held down for.
 * 
 * @param {string} key The key to check the down state of.
 * 
 * @returns {boolean}
 */
function keyboard_check(key) {
  return !!_key_state[key];
}

/**
 * This function will set the font to be used for all further text drawing. This font must have been added using CSS, inside the font.css file in this directory.
 * 
 * @param {object} font The name of the font to use.
 */
function draw_set_font(font) {
  currentFontName = font.name;
  ctx.font = `${font.size}px '${currentFontName}'`;
}

/**
 * This function permits you to go to any room in your game project,. You supply the room index (stored in the variable for the room name). Note that the room will not change until the end of the event where the function was called, so any code after this has been called will still run if in the same event. This function will also trigger the Room End event. 
 * WARNING: This function takes the room name as a string (so instead of room_menu itd be "room_menu" with the quotes).
 * 
 * @param {string} index 
 */
function room_goto(index) {
  const cleanedName = index.startsWith('room_') ? index.slice(5) : index;
  window.location.href = `/room/${cleanedName}/`;
}

export { audio_play_sound, audio_is_playing, audio_stop_all, draw_get_font, draw_set_color, draw_set_font, draw_text, draw_text_transformed, keyboard_check,  keyboard_check_pressed, currentDrawColor, currentFontName, room_goto };