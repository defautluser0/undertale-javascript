// @ts-check

/// <reference path="types.d.ts" />

import { _key_prev_state, _key_state } from "/imports/input.js";
import { playingSounds, c_white, rooms } from "/imports/assets.js";
import { ctx, canvas } from "/imports/canvasSetup.js";
import global from "/imports/assets/global.js";

let ini_filename = null;
let ini_data = {};
let ini_loaded = false;
let text_data = Array(32)
  .fill()
  .map(() => ({ /** @type {ID} */ name: null, data: "" }));
let text_loaded = Array(32)
  .fill()
  .map(() => ({ name: null, loaded: false }));
let text_read = Array(32)
  .fill()
  .map(() => ({ name: null }));
let text_write = Array(32)
  .fill()
  .map(() => ({ name: null }));
let text_total = Array(32)
  .fill()
  .map(() => ({ name: null }));
let text_read_line = Array(32)
  .fill()
  .map(() => ({ name: null, line: 0 }));
let text_write_line = Array(32)
  .fill()
  .map(() => ({ name: null, line: 0 }));
const __ds_map_store = {};
let __ds_map_next_id = 0;

const surfaces = [];
surfaces[-1] = { canvas: canvas, context: ctx };
let surfaceIdCounter = 0;
let context = ctx;
let currCanvas = canvas;
context.imageSmoothingEnabled = false;

const spriteOffsets = {
  spr_tobdog_summer: {
    xoffset: 15,
    yoffset: 22,
  },
  spr_tobdog_sleep_trash: {
    xoffset: 13,
    yoffset: 6,
  },
  spr_blconwdshrt: {
    xoffset: 2,
    yoffset: 2,
  },
  spr_switch: {
    xoffset: 10,
    yoffset: 10,
  },
};

const SEEK = {
  start: 0,
  current: 1,
  end: 2,
};

function float32ToFloat16(value) {
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);

  floatView[0] = value;
  const x = int32View[0];

  const bits = (x >> 16) & 0x8000; // sign bit
  const m = (x >> 12) & 0x07ff; // mantissa
  const e = (x >> 23) & 0xff; // exponent

  if (e < 103) {
    // Too small, become zero
    return bits;
  }
  if (e > 142) {
    // Too large, become Inf
    return bits | 0x7c00;
  }

  let exp = e - 112;
  let mant = m >> 1;

  // Round mantissa
  if ((m & 1) === 1) mant++;

  return bits | (exp << 10) | mant;
}

function float16ToFloat32(value) {
  const s = (value & 0x8000) >> 15;
  let e = (value & 0x7c00) >> 10;
  let f = value & 0x03ff;

  if (e === 0) {
    if (f === 0) {
      // Zero
      return s ? -0 : 0;
    } else {
      // Subnormal
      e = 1;
      while ((f & 0x0400) === 0) {
        f <<= 1;
        e--;
      }
      f &= ~0x0400;
    }
  } else if (e === 31) {
    // Inf or NaN
    return f === 0 ? (s ? -Infinity : Infinity) : NaN;
  }

  e = e + (127 - 15);
  f = f << 13;

  const int32 = (s << 31) | (e << 23) | f;
  const floatView = new Float32Array(1);
  const int32View = new Int32Array(floatView.buffer);

  int32View[0] = int32;
  return floatView[0];
}

// Buffer storage and helper
function createBuffer(size, type, alignment) {
  alignment = Math.max(1, Math.floor(alignment));

  if (size % alignment !== 0) {
    size = size + (alignment - (size % alignment));
  }

  const ab = new ArrayBuffer(size);

  return {
    data: ab,
    dv: new DataView(ab),
    size: size,
    pos: 0,
    type: type,
    alignment: alignment,
    surfaceMap: new Map(),
  };
}

function encodeUTF8(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function decodeUTF8(bytes) {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

const offCanvas = document.createElement("canvas");
const offctx = offCanvas.getContext("2d");
offctx.imageSmoothingEnabled = false;

export let currentDrawColor = c_white;
export let currentFont = null;
export let secondFont = null;
export let thirdFont = null;
export const instances = new Map();

const spriteCache = {};
const maskCache = {};
const tileCache = {};
const bgCache = {};
const globalTintCache = new Map();
if (global.debug === 1) {
  globalThis.instances = instances;
}

export function getBoundingBox() {
  // @ts-ignore
  const scaleX = this.image_xscale ?? 1;
  // @ts-ignore
  const scaleY = this.image_yscale ?? 1;

  // @ts-ignore
  const sprite = this.sprite_index;
  // @ts-ignore
  const frame = Math.round(this.image_index) || 0;

  // Try exact mask path first
  let maskPath = `/spr/masks/${sprite}_${frame}.png`;
  let mask = loadImageCached(maskPath, maskCache);

  // If not loaded, try frame 0 mask
  if (!mask.loaded || !mask.imageData) {
    maskPath = `/spr/masks/${sprite}_0.png`;
    mask = loadImageCached(maskPath, maskCache);

    if (!mask.loaded || !mask.imageData) {
      // Fallback to dummy bounds if still not loaded
      const fallbackWidth = 0 * scaleX;
      const fallbackHeight = 0 * scaleY;
      // @ts-ignore
      this.bbox_left = this.x;
      // @ts-ignore
      this.bbox_top = this.y;
      // @ts-ignore
      this.bbox_right = this.x + fallbackWidth;
      // @ts-ignore
      this.bbox_bottom = this.y + fallbackHeight;
      return;
    }
  }

  const data = mask.imageData.data;
  const width = mask.imageData.width;
  const height = mask.imageData.height;

  // Find the bounding box of white (collision) pixels
  let left = width,
    top = height,
    right = 0,
    bottom = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx],
        g = data[idx + 1],
        b = data[idx + 2];
      if (r === 255 && g === 255 && b === 255) {
        if (!found) found = true;
        if (x < left) left = x;
        if (y < top) top = y;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (!found) {
    // No white pixels — treat as empty hitbox
    // @ts-ignore
    this.bbox_left = this.x;
    // @ts-ignore
    this.bbox_top = this.y;
    // @ts-ignore
    this.bbox_right = this.x;
    // @ts-ignore
    this.bbox_bottom = this.y;
    return;
  }

  // Apply position and scale
  // @ts-ignore
  const bboxX1 = this.x + left * scaleX;
  // @ts-ignore
  const bboxX2 = this.x + (right + 1) * scaleX;
  // @ts-ignore
  const bboxY1 = this.y + top * scaleY;
  // @ts-ignore
  const bboxY2 = this.y + (bottom + 1) * scaleY;

  this.bbox_left = Math.min(bboxX1, bboxX2);
  this.bbox_right = Math.max(bboxX1, bboxX2);
  this.bbox_top = Math.min(bboxY1, bboxY2);
  this.bbox_bottom = Math.max(bboxY1, bboxY2);
}

// image cache loader
export function loadImageCached(path, cache) {
  if (cache[path]) {
    return cache[path];
  }
  if (global.maskCache[path]) {
    return global.maskCache[path];
  }
  const img = new Image();
  img.src = path;
  cache[path] = { img, loaded: false, imageData: null };

  img.onload = () => {
    cache[path].loaded = true;

    // create offscreen canvas to get pixel data
    const cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = img.width;
    cacheCanvas.height = img.height;
    const ctx = cacheCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    cache[path].imageData = ctx.getImageData(0, 0, img.width, img.height);
  };

  return cache[path];
}

/**
 * With this function you can play any sound asset in your game. You provide the sound asset and assign it a priority, which is then used to determine how sounds are dealt with when the number of sounds playing is over the limit set by the function audio_channel_num(). Lower priority sounds will be stopped in favour of higher priority sounds, and the priority value can be any real number (the actual value is arbitrary, and can be from 0 to 1 or 0 to 100, as GameMaker will prioritize them the same). The higher the number the higher the priority, so a sound with priority 100 will be favoured over a sound with priority 1. The third argument is for making the sound loop and setting it to true will make the sound repeat until it's stopped manually, and setting it to false will play the sound once only.
 *
 * @param {Sound} index The index of the sound to play.
 * @param {Real} priority Set the channel priority for the sound.
 * @param {Boolean} loop Sets the sound to loop or not.
 * @param {Real} gain [OPTIONAL] Value for the gain.
 * @param {Real} offset [OPTIONAL] The time (in seconds) to set the start point to. Values longer than the length of the given sound are ignored.
 * @param {Real} pitch [OPTIONAL] The pitch multiplier (default 1).
 *
 * @returns {SoundInstance}
 */
export function audio_play_sound(
  index,
  priority,
  loop,
  gain = 1,
  offset = 0,
  pitch = 1
) {
  if (!index || typeof index !== "object") return null;

  // Check if any instance of this sound is playing and compare priorities
  for (const [id, data] of playingSounds.entries()) {
    if (data.sound === index && !index.loop()) {
      if (priority >= data.priority) {
        index.stop(id);
        playingSounds.delete(id);
      } else {
        return null;
      }
    }
  }

  index.loop(loop);
  index.volume(gain);
  const id = index.play();
  index.seek(offset, id);
  index.rate(pitch, id);

  playingSounds.set(id, { sound: index, priority });

  return id;
}
/**
 * This function can be used to change the pitch of a given sound. The sound can either be one referenced from an index for an individual sound being played which has been stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions, or an actual sound asset from the Asset Browser. If it is an index of a playing sound, then only that instance will be changed, however when using a sound asset from the Asset Browser, all instances of that sound asset being played will be changed. The pitch argument is a pitch multiplier, in that the input value multiplies the current pitch by that amount, so the default value of 1 is no pitch change, while a value of less than 1 will lower the pitch and greater than 1 will raise the pitch. It is best to use small increments for this function as any value under 0 or over 5 may not be audible anyway. It is worth noting that the total pitch change permitted is clamped to (1/256) - 256 octaves, so any value over or under this will not be registered.
 *
 * @param {Sound} index The index of the sound to change.
 * @param {Real} pitch The pitch multiplier (default 1).
 */
export function audio_sound_pitch(index, pitch, id = null) {
  index.rate(pitch, id ?? index._sounds[0]?._id);
}

/**
 * With this function you can fade a sound in or out over a given length of time, or it can be used to set the sound gain instantly. The time is measured in milliseconds, and the function requires that you input a final level of gain for the sound to have reached by the end of that time. This gain can be between 0 (silent) and any value greater than 0, although normally you'd consider the maximum volume as 1. Anything over 1 can be used but, depending on the sound used and the platform being compiled to, you may get distortion or clipping when the sound is played back. Note that the gain scale is linear, and to instantly change the gain, simply set the time argument to 0. This function will affect all instances of the sound that are playing currently in the room if the index is a sound resource, and the final volume will be the volume at which all further instances of the sound will be played. However if you have used the index returned from a function like audio_play_sound() it will only affect that one instance of the sound.
 *
 * @param {Sound} index The index of the sound to set the gain for.
 * @param {Real} volume Value for the music volume.
 * @param {Real} time The length for the change in gain in milliseconds.
 */
export function audio_sound_gain(index, volume, time = 0, id = null) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) {
    const currentVol = index.volume(id);
    const fromVol = isFinite(currentVol) ? currentVol : index._volume || 1;
    index.fade(fromVol, volume, time, id);
  }
}

/**
 * This function will check the given sound to see if it is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be checked and if any of them are playing the function will return true otherwise it will return false. Note that this function will still return true if the sound being checked has previously been paused using the audio_pause_sound() function.
 *
 * @param {Sound} index The index of the sound to check.
 *
 * @returns {Boolean}
 */
export function audio_is_playing(index, id = null) {
  if (typeof index !== "object" || index === null) return;
  id = id ?? index._sounds[0]?._id;
  return id !== null ? index.playing(id) : false;
}

/**
 * This function will stop ALL sounds that are currently playing
 *
 * @returns {void}
 */
export function audio_stop_all() {
  // @ts-ignore
  Howler.stop();
  playingSounds.clear();
  global.playing1 = false;
  global.playing2 = false;
}

/**
 * This function will stop the given sound if it is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be stopped.
 *
 * @param {Sound} index The index of the sound to stop.
 */
export function audio_stop_sound(index, id = null, currentsong) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) index.stop(id);
  if (currentsong === 1) {
    global.playing1 = false;
  }
  if (currentsong === 2) {
    global.playing2 = false;
  }
}

/**
 * This function will get the font currently assigned for drawing text. The function will return -1 if no font is set, or the name of the font assigned.
 *
 * @returns {Font} The font name, or -1 if none.
 */
export function draw_get_font() {
  // @ts-ignore
  if (currentFont === null) return -1;
  return currentFont;
}

/**
 * With this function you can set the base draw colour for the game. This will affect drawing of fonts, forms, primitives and 3D, however it will not affect sprites (drawn manually or by an instance). If any affected graphics are drawn with their own colour values, this value will be ignored.
 *
 * @param {Colour} col The colour to set for drawing.
 * @returns {void}
 */
export function draw_set_color(col) {
  currentDrawColor = col.toLowerCase();
  context.fillStyle = currentDrawColor;
  context.strokeStyle = currentDrawColor;
}

/**
 * With this function you can draw any string at any position within the room. To combine strings you can use + and you can also use \n within a string to add a line break so it is drawn over multiple lines.
 *
 * @param {Real} x The x coordinate of the drawn string.
 * @param {Real} y The y coordinate of the drawn string.
 * @param {String} string The string to draw.
 * @returns {void}
 */
export function draw_text(x, y, string, second = 0) {
  draw_text_transformed(x, y, string, 1, 1, 0, second);
}

/**
 * This function will draw text in a similar way to draw_text() only now you can choose to scale the text along the horizontal or vertical axis (effectively stretching or shrinking it) and also have it be drawn at an angle (where 0 is normal and every degree over 0 rotates the text anti-clockwise).
 *
 * @param {Real} x The x coordinate of the drawn string.
 * @param {Real} y The y coordinate of the drawn string.
 * @param {string} string The string to draw.
 * @param {Real} xscale The horizontal scale (default 1).
 * @param {Real} yscale The vertical scale(default 1).
 * @param {Real} angle The angle of the text.
 * @returns {void}
 */
export function draw_text_transformed(
  x,
  y,
  string,
  xscale = 1,
  yscale = 1,
  angle = 0,
  second = 0
) {
  try {
    let font = {};
    if (second === 0) {
      font = currentFont;
    } else if (second === 1) {
      font = secondFont;
    } else if (second === 2) {
      font = thirdFont;
    }

    if (!font) {
      throw new Error(
        `draw_text_transformed(${x}, ${y}, "${string}", ${xscale}, ${yscale}, ${angle}): font not set. Please run draw_set_font(font_object);.`
      );
    }

    if (!font.image || font.loading) {
      console.warn("Font not loaded. Drawing skipped for this frame.");
      return;
    }

    const lines = String(string).split(/\n|#/); // Handle line breaks
    const lineHeight = font.glyphs[" "]?.h || font.size;

    // Save context and apply global transform
    context.save();
    context.translate(x, y);
    context.rotate(-((angle * Math.PI) / 180));
    context.scale(xscale, yscale);

    let yOffset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let xOffset = 0;

      for (const char of line) {
        const glyph = font.glyphs[char];
        if (!glyph) {
          xOffset += font.size; // fallback spacing
          continue;
        }

        const offsetX = glyph.offset || 0;

        context.save();
        context.translate(xOffset + offsetX, yOffset);

        if (currentDrawColor !== c_white) {
          const tintedGlyphCanvas = get_tinted_glyph(
            glyph,
            currentDrawColor,
            char,
            second
          );
          context.drawImage(tintedGlyphCanvas, 0, 0);
        } else {
          context.drawImage(
            font.image,
            glyph.x,
            glyph.y,
            glyph.w,
            glyph.h,
            0,
            0,
            glyph.w,
            glyph.h
          );
        }

        context.restore();

        xOffset += glyph.shift ?? glyph.w + (glyph.offset || 0);
      }

      yOffset += lineHeight;
    }

    context.restore();
  } catch (error) {
    console.error(error);
  }
}

// draw_text_transformed helper
function get_tinted_glyph(glyph, tintColor, char, second) {
  tintColor = tintColor.toLowerCase();

  let font;
  if (second === 1) {
    font = secondFont;
  } else if (second === 2) {
    font = thirdFont;
  } else {
    font = currentFont;
  }

  const fontId = font.file || "???";
  const cacheKey = `${fontId}_${char}_${tintColor}`;

  if (globalTintCache.has(cacheKey)) {
    return globalTintCache.get(cacheKey);
  }

  const cacheCanvas = document.createElement("canvas");
  const gctx = cacheCanvas.getContext("2d");

  // Step 1: Draw the original glyph
  gctx.drawImage(
    font.image,
    glyph.x,
    glyph.y,
    glyph.w,
    glyph.h,
    0,
    0,
    glyph.w,
    glyph.h
  );

  // Step 2: Multiply blend the tint color
  gctx.globalCompositeOperation = "multiply";
  gctx.fillStyle = tintColor;
  gctx.fillRect(0, 0, glyph.w, glyph.h);

  // Step 3: Preserve alpha only
  gctx.globalCompositeOperation = "destination-in";
  gctx.drawImage(
    font.image,
    glyph.x,
    glyph.y,
    glyph.w,
    glyph.h,
    0,
    0,
    glyph.w,
    glyph.h
  );

  // Reset for safety
  gctx.globalCompositeOperation = "source-over";

  globalTintCache.set(cacheKey, cacheCanvas);
  return canvas;
}

/**
 * With this function you can check to see if a key has been pressed or not. Unlike the keyboard_check() function, this function will only run once for every time the key is pressed down, so for it to trigger again, the key must be first released and then pressed again. The function will take a keycode value as returned by any of the vk_* constants listed far above.
 *
 * @param {KeyConstant} key The key to check the pressed state of.
 *
 * @returns {Boolean}
 */
export function keyboard_check_pressed(key) {
  // If numeric, convert to character
  if (typeof key === "number") {
    key = String.fromCharCode(key);
  }

  // If a single character, map to key code
  if (typeof key === "string" && key.length === 1) {
    const code = key.toUpperCase();

    if (code >= "A" && code <= "Z") {
      key = "Key" + code;
    } else if (code >= "0" && code <= "9") {
      key = "Digit" + code;
    } else {
      // Map symbols to their KeyboardEvent.code equivalents
      key =
        {
          " ": "Space",
          "-": "Minus",
          "=": "Equal",
          "[": "BracketLeft",
          "]": "BracketRight",
          "\\": "Backslash",
          ";": "Semicolon",
          "'": "Quote",
          ",": "Comma",
          ".": "Period",
          "/": "Slash",
          "`": "Backquote",
        }[key] || key; // fallback to raw key if unknown
    }
  }

  return !!_key_state[key] && !_key_prev_state[key];
}

/**
 * With this function you can check to see if a key is held down or not. The function will take a keycode value as returned by the function ord (only capital letters from A-Z or numbers from 0-9), or any of the vk_* constants listed far above. Unlike the keyboard_check_pressed or keyboard_check_released functions which are only triggered once when the key is pressed or released, this function is triggered every step that the key is held down for.
 *
 * @param {KeyConstant} key The key to check the down state of.
 *
 * @returns {Boolean}
 */
export function keyboard_check(key) {
  return !!_key_state[key];
}

/**
 * This function will set the font to be used for all further text drawing. This font must have been added into the font assets of the game.
 *
 * @param {Font} font The name of the font to use.
 */
export function draw_set_font(font, second = 0) {
  let targetFont;

  if (second === 1) {
    secondFont = font;
    targetFont = secondFont;
  } else if (second === 2) {
    thirdFont = font;
    targetFont = thirdFont;
  } else {
    currentFont = font;
    targetFont = currentFont;
  }

  if (!targetFont.image && !targetFont.loading) {
    targetFont.loading = true;
    const img = new Image();
    img.src = targetFont.file;
    img.onload = () => {
      targetFont.image = img;
      targetFont.loading = false;
    };
  }
}

/**
 * This function permits you to go to any room in your game project. You supply the room index (stored in the variable for the room name). Note that the room will not change until the end of the event where the function was called, so any code after this has been called will still run if in the same event. This function will also trigger the Room End event.  WARNING: This function takes the room name as a string (so instead of room_menu itd be "room_menu" with the quotes). Room Numbers should work fine.
 *
 * @param {Room} index
 */
export function room_goto(index) {
  if (typeof index !== "string") {
    if (typeof index === "number") {
      index = room_get_name(index);
    } else {
      console.error(`room ${index} is nonexistant / not a valid type`);
      return;
    }
  }
  global.eventDone = false;
  global.roomEnd = true;
  global.nextRoom = `/room/${index.slice(5)}/`;
}

/**
 * This is the instance_create() description.
 * TODO: document
 *
 * @param {Real} x The x position the object will be created at
 * @param {Real} y The y position the object will be created at
 * @param {Obj} obj The object index of the object to create an instance of
 * @returns {Instance}
 */
export function instance_create(x, y, obj) {
  try {
    if (
      obj === null ||
      typeof obj !== "object" ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      throw new Error(
        `instance_create: called with invalid parameters: ${x}, ${y}, ${obj}`
      );
    }
    const instance = obj.create();
    if (!instance)
      throw new Error("instance_create: obj has invalid or no create()");

    instance._object = obj;

    instance.x = x;
    instance.y = y;
    instance.startx = x;
    instance.starty = y;
    instance.xstart = x;
    instance.ystart = y;
    instance.previousx = x;
    instance.previousy = y;
    instance.xprevious = x;
    instance.yprevious = y;

    if (!instances.has(obj)) {
      instances.set(obj, []);
    }
    instances.get(obj).push(instance);

    if (instance.create2 === true) {
      obj.createContext?.call(instance);
      if (global.newRoom[0]) {
        global.execStart = true;
      }
    } else {
      obj.roomStart?.call(instance);
    }

    return instance;
  } catch (error) {
    console.error(error);
  }
}

/**
 * You call this function whenever you wish to "destroy" an instance, normally triggering a Destroy Event and also a Clean Up Event. This will remove it from the room until the room is restarted (unless the room is persistent). Calling the function will simply destroy all instances of a particular object.
 *
 * @param {Targetable} index The object asset to destroy instances of
 * @returns {void}
 */
export function instance_destroy(index) {
  if (typeof index !== "object") return;
  // Helper: is the instance of (or child of) obj?
  function isInstanceOf(inst, objToMatch) {
    let currentObj = inst._object;
    while (currentObj) {
      if (currentObj === objToMatch) return true;
      currentObj = currentObj.parent ?? null;
    }
    return false;
  }

  // If `target` is a specific instance (has `_object`), just destroy it
  if (index && typeof index === "object" && "_object" in index) {
    index.destroy?.call(index);
    index.cleanUp?.call(index);
    index._destroyed = true;
    return;
  }

  // Otherwise, assume it's an object module: destroy all matching instances (including children)
  for (const list of instances.values()) {
    // Make a copy so we can safely remove while iterating
    const toDestroy = list.filter((inst) => isInstanceOf(inst, index));
    for (const inst of toDestroy) {
      inst.destroy?.call(inst);
      inst.cleanUp?.call(inst);
      inst._destroyed = true;
    }
  }
}

/**
 * This function can be used in two ways depending on what you wish to check. You can give it an object_index to check for, in which case this function will return true if any active instances of the specified object exist in the current room, or you can also supply it with an instance id, in which case this function will return true if that specific instance exists and is active in the current room.
 *
 * @param {Targetable} obj The object or instance to check for the exsistence of
 * @returns {Boolean}
 */
export function instance_exists(obj) {
  // @ts-expect-error
  if (obj._object) obj = obj._object;
  for (const [key, list] of instances) {
    if (!Array.isArray(list) || list.length === 0) continue;

    // Check if this key is exactly obj or inherits from obj
    let current = key;
    while (current) {
      if (current === obj) return true;
      current = current.parent;
    }
  }
  return false;
}

/**
 * With this function you can find out how many active instances of the specified object exists in the room. When checking using this function, if the object is a parent, then all child objects will also be included in the return value, and also note that those instances which have been deactivated with the instance deactivate functions will not be included in this check.
 *
 * @param {Targetable} obj
 * @returns {Real}
 */
export function instance_number(obj) {
  let count = 0;

  for (const [_, list] of instances.entries()) {
    for (const inst of list) {
      let current = inst._object;

      while (current) {
        if (current === obj) {
          count++;
          break;
        }
        current = current.parent ?? null; // walk up the parent chain
      }
    }
  }

  return count;
}

/**
 * This function draws the given sprite and sub-image at a position within the game room. For the sprite you can use the instance variable sprite_index to get the current sprite that is assigned to the instance running the code, or you can use any other sprite asset. The same goes for the sub-image, as this can also be set to the instance variable image_index which will set the sub-image to that selected for the current instance sprite (note, that you can draw a different sprite and still use the sub-image value for the current instance), or you can use any other value for this to draw a specific sub-image of the chosen sprite. If the value is larger than the number of sub-images, then GameMaker will automatically loop the number to select the corresponding image (for example, if the sprite being drawn has 5 sub-images numbered 0 to 4 and we set the index value to 7, then the function will draw the third sub-image, numbered 2). Finally, the x and y position is the position within the room that the sprite will be drawn, and it is centered on the sprite x offset and y offset.
 *
 * @param {Sprite} sprite The index of the sprite to draw
 * @param {Real} subimg The sub-image (frame) of  the  sprite to draw (image_index or -1 correlate to the current frame of animation in the object)
 * @param {Real} x The x coordinate of where to draw the spirte
 * @param {Real} y The y coordinate of where to draw the sprite
 */
export function draw_sprite(sprite, subimg, x, y) {
  draw_sprite_ext(sprite, subimg, x, y, 1, 1, 0, c_white, 1);
}

/**
 * This function will draw the given sprite as in the function draw_sprite() but with additional options to change the scale, blending, rotation and alpha of the sprite being drawn. Changing these values does not modify the resource in any way (only how it is drawn), and you can use any of the available sprite variables instead of direct values for all the arguments in the function.
 *
 * @param {Sprite} sprite The index of the sprite to draw
 * @param {Real} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in the object)
 * @param {Real} x The x coordinate of where to draw the sprite
 * @param {Real} y The y coordinate of where to draw the sprite
 * @param {Real} xscale The horizontal scaling of the sprite, as a multiplier: 1 = normall scaling, 0.5 is half etc...
 * @param {Real} yscale The vertical scaling of the sprite as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {Real} rot The rotation of the sprite. 0=right way up, 90=rotated 90 degrees counter-clockwise etc...
 * @param {Colour} colour The colour with which to blend the sprite. c_white is to display it normally
 * @param {Real} alpha The alpha of the sprite (from 0 to 1 where 0 is transparent and 1 opaque).
 * @returns {void}
 */
export function draw_sprite_ext(
  sprite,
  subimg,
  x,
  y,
  xscale,
  yscale,
  rot,
  colour,
  alpha,
  returnImg = 0
) {
  if (!sprite) return;
  if (alpha < 0) alpha = 0;

  subimg = Math.floor(subimg);

  const frame = subimg;
  const key = `/spr/${sprite}/${sprite}_${frame}.png`;

  const cached = loadImageCached(key, spriteCache);
  if (!cached.loaded) return;

  const img = cached.img;

  const offset = spriteOffsets[sprite] || { xoffset: 0, yoffset: 0 };
  const ox = offset.xoffset || 0;
  const oy = offset.yoffset || 0;

  context.save();

  context.translate(x - ox * xscale, y - oy * yscale);
  context.rotate((rot * Math.PI) / 180);
  context.scale(xscale, yscale);
  context.globalAlpha = alpha;

  if (colour && colour.toLowerCase() !== c_white) {
    // Tinting logic using offscreen canvas
    const tintCanvas = document.createElement("canvas");
    tintCanvas.width = img.width;
    tintCanvas.height = img.height;

    const tintctx = tintCanvas.getContext("2d");

    // Draw the sprite image first
    tintctx.drawImage(img, 0, 0);

    // Multiply the color by the sprites color
    tintctx.globalCompositeOperation = "multiply";
    tintctx.fillStyle = colour;
    tintctx.fillRect(0, 0, img.width, img.height);

    tintctx.globalCompositeOperation = "destination-in";
    tintctx.drawImage(img, 0, 0);

    // Draw the tinted canvas onto main canvas
    context.drawImage(tintCanvas, 0, 0);
  } else {
    // No tint, just draw normal
    context.drawImage(img, 0, 0);
  }

  context.restore();

  if (returnImg === 1 && img) {
    return img;
  }
}

/**
 * With this function you can draw part of any sprite at a given position within the room. As with draw_sprite() you can specify a sprite and a sub-image for drawing, then you must give the relative coordinates within the sprite of the area to select for drawing. This means that a left position of 0 and a top position of 0 would be the top left corner of the sprite and all further coordinates should be taken from that position.
 *
 * @param {Sprite} sprite The index of the sprite to draw.
 * @param {Real} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in the object).
 * @param {Real} left The x position on the sprite of the top left corner of the area to draw.
 * @param {Real} top The y position on the sprite of the top left corner of the area to draw.
 * @param {Real} width The width of the area to draw.
 * @param {Real} height The height of the area to draw.
 * @param {Real} x The x coordinate of where to draw the sprite.
 * @param {Real} y The y coordinate of where to draw the sprite.
 */
export function draw_sprite_part(
  sprite,
  subimg,
  left,
  top,
  width,
  height,
  x,
  y
) {
  draw_sprite_part_ext(
    sprite,
    subimg,
    left,
    top,
    width,
    height,
    x,
    y,
    1,
    1,
    c_white,
    1
  );
}

/**
 * This function will draw a part of the chosen sprite at the given position following the same rules as per draw_sprite_part(), only now you can scale the part, blend a colour with it, or change its alpha when drawing it to the screen (the same as when drawing a sprite with draw_sprite_ext()).
 *
 * @param {Sprite} sprite The index of the sprite to draw.
 * @param {Real} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in the object).
 * @param {Real} left The x position on the sprite of the top left corner of the area to draw.
 * @param {Real} top The y position on the sprite of the top left corner of the area to draw.
 * @param {Real} width The width of the area to draw.
 * @param {Real} height The height of the area to draw.
 * @param {Real} x The x coordinate of where to draw the sprite.
 * @param {Real} y The y coordinate of where to draw the sprite.
 * @param {Real} xscale The horizontal scaling of the sprite, as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {Real} yscale The vertical scaling of the sprite, as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {Colour} colour The colour with which to blend the sprite. c_white is to display it normally.
 * @param {Real} alpha The alpha of the sprite (from 0 to 1 where 0 is transparent and 1 opaque).
 */
export function draw_sprite_part_ext(
  sprite,
  subimg,
  left,
  top,
  width,
  height,
  x,
  y,
  xscale = 1,
  yscale = 1,
  colour = c_white,
  alpha = 1
) {
  if (!sprite) return;
  if (left < 0) left = 0;
  if (top < 0) top = 0;

  x = Math.round(x);
  y = Math.round(y);
  subimg = Math.floor(subimg);

  const key = `/spr/${sprite}/${sprite}_${subimg}.png`;

  // Cache image
  if (!spriteCache[key]) {
    const img = new Image();
    img.src = key;
    spriteCache[key] = { img, loaded: false };
    img.onload = () => {
      spriteCache[key].loaded = true;
    };
  }

  const cached = spriteCache[key];
  if (!cached.loaded) {
    // Image not loaded yet, skip drawing this frame
    return;
  }

  const img = cached.img;

  // Calculate origin for centering

  context.save();

  context.translate(x, y);
  context.scale(xscale, yscale);
  context.globalAlpha = alpha;

  if (colour.toLowerCase() !== c_white) {
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offctx = offscreen.getContext("2d");

    offctx.drawImage(img, left, top, width, height, 0, 0, width, height);

    offctx.globalCompositeOperation = "source-in";
    offctx.fillStyle = colour;
    offctx.fillRect(0, 0, width, height);

    context.drawImage(offscreen, 0, 0);
  } else {
    context.drawImage(img, left, top, width, height, 0, 0, width, height);
  }

  context.restore();
}

/**
 * You can use this function to return a specific character at a specific position within a string, with the index starting at 1 for the first character. If no character is found or the string is shorter than the given index value, an empty string "" is returned, however if the given index is equal to or smaller than 0, then the first character of the string is returned.
 *
 * @param {String} str The string to check.
 * @param {Real} index The position to get the character from.
 * @returns {String}
 */
export function string_char_at(str, index) {
  return str.charAt(index) ?? "";
}

/**
 * This function takes any real number and rounds it up to the nearest integer. Care should be taken with this function as one common mistake is to use it round up a random value and expect it always to be greater than 1, ie: "let int = ceil(random(5));" Now, you would expect this code to always give an integer between 1 and 5, but this may not always be the case as there is a very small possibility that the random function will return 0, and rounding up 0 still gives you 0. This is a remote possibility but should be taken into account when using this function.
 *
 * @param {Real} x The number to change.
 * @returns {Real}
 */
export function ceil(x) {
  return Math.ceil(x);
}

/**
 * Returns the floor of n, that is, n rounded down to an integer. This is similar to the round() function, but it only rounds down, no matter what the decimal value, so floor(5.99999) will return 5, as will floor(5.2), floor(5.6457) etc...
 *
 * @param {Real} n The number to floor.
 * @returns {Real}
 */
export function floor(n) {
  return Math.floor(n);
}

/**
 * Just as it says, round() takes a number and rounds it up or down to the nearest integer. In the special case where the number supplied is exactly a half-integer (1.5, 17.5, -2.5, etc), the number will be rounded to the nearest even value, for example, 2.5 would be rounded to 2, while 3.5 will be rounded to 4. This type of rounding is called bankers rounding and over large numbers of iterations or when using floating point maths, it gives a statistically better rounding than the more traditional "round up if over .5 and round down otherwise" approach. What this means is that if the fraction of a value is 0.5, then the rounded result is the even integer nearest to the input value. So, for example, 23.5 becomes 24, as does 24.5, while -23.5 becomes -24, as does -24.5. This method treats positive and negative values symmetrically, so is therefore free of sign bias, and, more importantly, for reasonable distributions of values, the expected (average) value of the rounded numbers is the same as that of the original numbers.
 *
 * @param {Real} n The number to round
 * @returns {Real}
 */
export function round(n) {
  let floorNumber = Math.floor(n);
  let roundNumber = Math.round(n);

  // if the floor of the number is divisible by two and rounding the number is not divisible by two and (removing or adding 0.5 from the number) is equal to the floor of the number then return the floor of the number, else return the number rounded
  if (
    floorNumber % 2 === 0 &&
    roundNumber % 2 !== 0 &&
    (n - 0.5 === floorNumber || n + 0.5 === floorNumber)
  ) {
    return floorNumber;
  } else {
    return roundNumber;
  }
}

/**
 * This function returns a random floating-point (decimal) number between 0.0 (inclusive) and the specified upper limit (inclusive). For example, random(100) will return a value from 0 to 100.00, but that value can be 22.56473! You can also use real numbers and not integers in this function like this - random(0.5), which will return a value between 0 and 0.500.
 *
 * @param {Real} n The upper range from which the random number will be selected
 * @returns {Real}
 */
export function random(n) {
  return Math.random() * n;
}

/**
 * This function calls a Script Function or Method with the given arguments.
 *
 * @param {Script} scr The function/script or method that you want to call.
 * @param  {...any} args OPTIONAL The different arguments that you want to pass through to the function/script
 * @returns {any}
 */
export function script_execute(scr, ...args) {
  return scr.call(this, ...args);
}

/**
 * This function can be used to turn a value into a number. When using this function on a string, numbers, minus signs, decimal points and exponential parts in the string are taken into account, while other characters (such as letters) will cause an error to be thrown.
 *
 * @param {String} n The string to be converted to a number.
 * @returns {Real}
 */
export function real(n) {
  return parseFloat(n);
}

/**
 * This function draws either an outline of a rectangle or a filled rectangle where the (x1,y1) position is the top left corner and the (x2,y2) position is the bottom right corner.
 *
 * @param {Real} x1 The x coordinate of the top left corner of the rectangle
 * @param {Real} y1 The y coordinate of the top left corner of the rectangle
 * @param {Real} x2 The x coordinate of the bottom right corner of the rectangle
 * @param {Real} y2 The y coordinate of the bottom right corner of the rectangle
 * @param {Boolean} outline Whether the rectangle is drawn filled (false) or as a one pixel wide outline (true)
 */
export function draw_rectangle(x1, y1, x2, y2, outline) {
  context.fillStyle = currentDrawColor;
  context.strokeStyle = currentDrawColor;
  x1 = round(x1);
  x2 = round(x2);
  y1 = round(y1);
  y2 = round(y2);
  context.beginPath();
  context.rect(x1, y1, x2 - x1, y2 - y1);
  if (outline) {
    context.stroke();
  } else {
    context.fill();
  }
}

/**
 * This function takes a single character input string and returns the Unicode (UTF16) value for that character. Note that when used with the keyboard_check* functions, the input string can only be one character in length and can only be a number from 0 to 9 or a capitalised Roman character from A to Z.
 *
 * @param {String} string The string with which to find the Unicode value
 * @returns {Real}
 */
export function ord(string) {
  return string.codePointAt(0);
}

/**
 * This is the draw_background() help.
 *
 * @param {Background} background The background to draw.
 * @param {Real} x The x position to draw the background at.
 * @param {Real} y The y position to draw the background at.
 * @returns {void}
 */
export function draw_background(background, x, y) {
  if (!background) return;

  const key = `/bg/${background}.png`;
  const cached = loadImageCached(key, bgCache);

  if (!cached.loaded) return;

  const img = cached.img;

  context.drawImage(img, round(x), round(y));
}

/**
 * This function is used to remove a part of the given string. You supply the input string, the starting position within that string to remove characters from (the index starts at 1) and the number of characters to remove. The function will return a new string without that part in it.
 *
 * @param {String} str The string to copy and delete from.
 * @param {Real} index The position of the first character to remove (from 1).
 * @param {Real} count The number of characters to remove.
 * @returns {String}
 */
export function string_delete(str, index, count) {
  if (index < 1 || count < 1) return str; // GameMaker-style: index starts at 1

  // Convert from 1-based to 0-based index
  let start = index - 1;

  return str.slice(0, start) + str.slice(start + count);
}

/**
 * With this function you can take two colours and then merge them together to make a new colour. The amount of each of the component colours can be defined by changing the "amount" argument, where a value of 0 will return the first colour (col1), a value of 1 will return the second colour (col2) and a value in between will return the corresponding mix. For example, a value of 0.5 will mix the two colours equally. The following image illustrates how this works by merging the colours red and blue together:
 *
 * @param {Colour} col1 The first colour to merge
 * @param {Colour} col2 The second colour to merge
 * @param {Real} amount How much of each colour should be merged. For example, 0 will return col1, 1 will return col2, and 0.5 would return a merge of both colours equally
 * @returns {string}
 */
export function merge_color(col1, col2, amount) {
  // Parse hex colors like "#RRGGBB"
  const c1 = hexToRgb(col1);
  const c2 = hexToRgb(col2);

  const r = Math.round(c1.r + (c2.r - c1.r) * amount);
  const g = Math.round(c1.g + (c2.g - c1.g) * amount);
  const b = Math.round(c1.b + (c2.b - c1.b) * amount);

  return rgbToHex(r, g, b);
}
export function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * With this function you can retrieve the index of the room after the room input into the function. For example you can use the variable room to get the index of the current room and then use this function to find the room that follows it, as listed in the Room Manager. If there is no room after the one you input then -1 is returned. Note that this function will not recognise or take into consideration rooms that have been added dynamically using room_add() or room_duplicate().
 *
 * @param {RoomIndex} numb The index of the room to get the next one after.
 * @returns {Real}
 */
export function room_next(numb) {
  if (typeof numb !== "number") {
    if (typeof numb === "string") {
      console.warn("please input index to room_next()");
      numb = rooms.indexOf(numb);
    } else return;
  }

  const roomIndex = rooms.indexOf(room_get_name(numb));
  if (roomIndex === -1) return -1;

  return roomIndex + 1;
}

/**
 * With this function you can retrieve the index of the room before the room input into the function. For example you can use the variable room to get the index of the current room and then use this function to find the room that comes before it, as listed in the rooms.js file. If there is no room before the one you input then -1 is returned. Note that this function will not recognise or take into consideration rooms that have been added dynamically using room_add() or room_duplicate().
 *
 * @param {RoomIndex} numb The index of the room to get the one before from.
 * @returns {Real}
 */
export function room_previous(numb) {
  if (typeof numb !== "number") {
    if (typeof numb === "string") {
      console.warn("please input index to room_previous()");
      numb = rooms.indexOf(numb);
    } else return;
  }

  const roomIndex = rooms.indexOf(room_get_name(numb));
  if (roomIndex === -1) return -1;

  return roomIndex - 1;
}

/**
 * With this function you can make your game go to the next one as listed in the rooms.js file at the time the game was opened. If this room does not exist, an error will be thrown and the game will be stopped. Note that the room will not change until the end of the event where the function was called, so any code after this has been called will still run if in the same event. This function will also trigger the Room End event.
 */
export function room_goto_next() {
  if (
    room_next(
      rooms.indexOf(
        `${window.location.href.slice(35, 39)}_${
          window.location.href.slice(40).split("/")[0]
        }`
      )
    ) === -1
  ) {
    throw new Error("room_goto_next: next room is nonexistant");
  }
  room_goto(
    room_get_name(
      room_next(
        rooms.indexOf(
          `${window.location.href.slice(35, 39)}_${
            window.location.href.slice(40).split("/")[0]
          }`
        )
      )
    )
  );
}

/**
 * With this function you can make your game go to the previous one as listed in the rooms.js file at the time the game was opened. If this room does not exist, an error will be thrown and the game will be stopped. Note that the room will not change until the end of the event where the function was called, so any code after this has been called will still run if in the same event. This function will also trigger the Room End event.
 */
export function room_goto_previous() {
  if (
    room_previous(
      rooms.indexOf(
        `${window.location.href.slice(35, 39)}_${
          window.location.href.slice(40).split("/")[0]
        }`
      )
    ) === -1
  ) {
    throw new Error("room_goto_previous: next room is nonexistant");
  }
  room_goto(
    room_get_name(
      room_previous(
        rooms.indexOf(
          `${window.location.href.slice(35, 39)}_${
            window.location.href.slice(40).split("/")[0]
          }`
        )
      )
    )
  );
}

/**
 * Collision_rectangle uses the first four arguments (x1,y1,x2,y2) to define an area within the current room and then checks to see if any object that is defined by the "obj" argument is in collision with that area. This collision can be checked as precise or not, and you may also choose to check for the instance running the code itself or not.
 *
 * @param {Real} x1 The x coordinate of the left side of the rectangle to check.
 * @param {Real} y1 The y coordinate of the top side of the rectangle to check.
 * @param {Real} x2 The x coordinate of the right side of the rectangle to check.
 * @param {Real} y2 The y coordinate of the bottom side of the rectangle to check.
 * @param {Targetable} obj The object or instance to check for.
 * @param {Boolean} prec Whether the check is based on pecise collisions (true, which is slower) or its bounding box in general (false, faster).
 * @param {Boolean} notme Whether the calling instance, if relevant, should be excluded (true) or not (false).
 * @returns {Instance}
 */
export function collision_rectangle(
  x1,
  y1,
  x2,
  y2,
  obj,
  prec = false,
  notme = false
) {
  if (!this) {
    console.warn("please call collision_rectangle with .call(inst, [args])");
    return;
  }
  if (
    typeof this.bbox_left !== "number" ||
    typeof this.bbox_right !== "number" ||
    typeof this.bbox_top !== "number" ||
    typeof this.bbox_bottom !== "number"
  ) {
    console.warn(`${this.name}'s bounding boxes not set.`);
    return null;
  }
  if (x1 > x2) [x1, x2] = [x2, x1];
  if (y1 > y2) [y1, y2] = [y2, y1];
  function isInstanceOf(inst, objToMatch) {
    let currentObj = inst._object;
    while (currentObj) {
      if (currentObj === objToMatch) return true;
      currentObj = currentObj.parent ?? null; // walk up using module's exported parent
    }
    return false;
  }

  for (const list of instances.values()) {
    for (const inst of list) {
      if (
        typeof inst.bbox_left !== "number" ||
        typeof inst.bbox_right !== "number" ||
        typeof inst.bbox_top !== "number" ||
        typeof inst.bbox_bottom !== "number"
      ) {
        continue;
      }
      if (notme && inst === this) continue;

      // @ts-expect-error
      if (obj !== "all" && !isInstanceOf(inst, obj)) continue;

      let bw = 0;
      let bh = 0;

      const spritePath = `/spr/${inst.sprite_index}/${inst.sprite_index}_${
        floor(inst.image_index) || 0
      }.png`;
      const spriteCacheEntry = loadImageCached(spritePath, spriteCache);

      if (!spriteCacheEntry.loaded) {
        // Sprite not loaded yet, fallback to default size or skip this instance for now
        bw = 32;
        bh = 32;
      } else {
        bw = spriteCacheEntry.img.width * (inst.image_xscale ?? 1);
        bh = spriteCacheEntry.img.height * (inst.image_yscale ?? 1);
      }

      const left = inst.bbox_left;
      const right = inst.bbox_right;
      const top = inst.bbox_top;
      const bottom = inst.bbox_bottom;

      if (!prec) {
        const hit = x1 <= right && x2 >= left && y1 <= bottom && y2 >= top;

        if (hit) {
          return inst;
        }
      } else {
        // Precise pixel collision using mask cache
        const sprite = inst.sprite_index;
        const frame = floor(inst.image_index) || 0;
        let url = `/spr/masks/${sprite}_${frame}.png`;

        let mask = loadImageCached(url, maskCache);

        // Fallback to frame 0 mask if current frame's mask isn't available
        if (!mask.loaded && frame !== 0) {
          url = `/spr/masks/${sprite}_0.png`;
          mask = loadImageCached(url, maskCache);
        }

        // Still skip if fallback mask not ready
        if (!mask.loaded || !mask.imageData) {
          continue;
        }

        const data = mask.imageData.data;
        const width = mask.imageData.width;

        // Calculate overlap rectangle in mask coordinates
        const scaleX = inst.image_xscale ?? 1;
        const scaleY = inst.image_yscale ?? 1;

        const maskWidth = mask.imageData.width;
        const maskHeight = mask.imageData.height;

        // Calculate overlap rectangle in world coords relative to instance position
        const dx = Math.floor(inst.x);
        const dy = Math.floor(inst.y);

        const sx_scaled = Math.max(0, Math.floor(x1 - dx));
        const sy_scaled = Math.max(0, Math.floor(y1 - dy));
        const ex_scaled = Math.min(bw * scaleX, Math.ceil(x2 - dx));
        const ey_scaled = Math.min(bh * scaleY, Math.ceil(y2 - dy));

        // Convert scaled overlap rectangle to mask pixel coordinates (unscaled)
        const sx = Math.floor(sx_scaled / scaleX);
        const sy = Math.floor(sy_scaled / scaleY);
        const ex = Math.min(maskWidth, Math.ceil(ex_scaled / scaleX));
        const ey = Math.min(maskHeight, Math.ceil(ey_scaled / scaleY));

        let collisionFound = false;
        outer: for (let y = sy; y < ey; y++) {
          for (let x = sx; x < ex; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx],
              g = data[idx + 1],
              b = data[idx + 2];
            if (r === 255 && g === 255 && b === 255) {
              collisionFound = true;
              break outer;
            }
          }
        }

        if (collisionFound) return inst;
      }
    }
  }

  return null;
}

/**
 * Collision_point checks the point specified by the arguments x1,y1 for a collision with any instance of the object specified by the argument "obj". this check can be either precise or not, but for precise collisions to be enabled, the object or instance that you are checking for must also have precise collisions enabled for their sprite. If not, the default check is based on bounding boxes.
 *
 * @param {Real} x The x coordinate of the point to check.
 * @param {Real} y The y coordinate of the point to check.
 * @param {Targetable} obj The object or instance to check for.
 * @param {Boolean} prec Whether the check is based on pecise collisions (true, which is slower) or its bounding box in general (false, faster).
 * @param {Boolean} notme Whether the calling instance, if relevant, should be excluded (true) or not (false).
 * @returns {Instance}
 */
export function collision_point(x, y, obj, prec, notme = false) {
  function isInstanceOf(inst, objToMatch) {
    let currentObj = inst._object;
    while (currentObj) {
      if (currentObj === objToMatch) return true;
      currentObj = currentObj.parent ?? null;
    }
    return false;
  }

  for (const list of instances.values()) {
    for (const inst of list) {
      if (notme && inst === this) continue;
      // @ts-expect-error
      if (obj !== "all" && !isInstanceOf(inst, obj)) continue;

      const sprite = inst.sprite_index;
      const frame = floor(inst.image_index) || 0;
      const spritePath = `/spr/${sprite}/${sprite}_${frame}.png`;
      const spriteCacheEntry = loadImageCached(spritePath, spriteCache);

      const scaleX = inst.image_xscale ?? 1;
      const scaleY = inst.image_yscale ?? 1;

      let bw = 32,
        bh = 32;
      if (spriteCacheEntry.loaded) {
        bw = spriteCacheEntry.img.width * scaleX;
        bh = spriteCacheEntry.img.height * scaleY;
      }

      // Bounding box check
      if (x >= inst.x && x < inst.x + bw && y >= inst.y && y < inst.y + bh) {
        // Load mask
        let url = `/spr/masks/${sprite}_${frame}.png`;
        let mask = loadImageCached(url, maskCache);

        // Fallback to _0 if mask for this frame doesn't exist
        if ((!mask.loaded || !mask.imageData) && frame !== 0) {
          url = `/spr/masks/${sprite}_0.png`;
          mask = loadImageCached(url, maskCache);
        }

        if (!mask.loaded || !mask.imageData) {
          // Fallback to bounding box hit
          return inst;
        }

        // Convert to local pixel coordinate inside the mask
        const localX = Math.floor((x - inst.x) / scaleX);
        const localY = Math.floor((y - inst.y) / scaleY);

        if (
          localX < 0 ||
          localY < 0 ||
          localX >= mask.imageData.width ||
          localY >= mask.imageData.height
        )
          continue;

        const idx = (localY * mask.imageData.width + localX) * 4;
        const r = mask.imageData.data[idx];
        const g = mask.imageData.data[idx + 1];
        const b = mask.imageData.data[idx + 2];

        if (r === 255 && g === 255 && b === 255) return inst;
      }
    }
  }

  return null;
}

/**
 * Collision_line checks along a line from point x1,y1 to point x2,y2 for a collision with any instance of the object specified by the argument "obj". this check can be either precise or not, but for precise collisions to be enabled, the object or instance that you are checking for must also have precise collisions enabled for their sprite. If not, the default check is based on bounding boxes.
 *
 * @param {Real} x1 The x coordinate of the start of the line.
 * @param {Real} y1 The y coordinate of the start of the line.
 * @param {Real} x2 The x coordinate of the end of the line.
 * @param {Real} y2 The y coordinate of the end of the line.
 * @param {Targetable} obj The object or instance to check for.
 * @param {Boolean} prec Whether the check is based on pecise collisions (true, which is slower) or its bounding box in general (false, faster).
 * @param {Boolean} notme Whether the calling instance, if relevant, should be excluded (true) or not (false).
 * @returns {Instance}
 */
export function collision_line(
  x1,
  y1,
  x2,
  y2,
  obj,
  prec = false,
  notme = false
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return null; // zero-length line

  const stepX = dx / steps;
  const stepY = dy / steps;

  for (let i = 0; i <= steps; i++) {
    const px = x1 + stepX * i;
    const py = y1 + stepY * i;

    // Use collision_point for each step to test collisions
    const hit = collision_point.call(this, px, py, obj, notme);
    if (hit) {
      if (!prec) return hit; // if not precise, return on first hit
      // if precise, could add more checks or return immediately anyway
      return hit;
    }
  }

  return null;
}

/**
 * This opens an ini_file for reading and/writing. If the ini_file does not exist at the location you are checking, GameMaker may create one, but only if you write data to it. If you have only read information from the ini file, then the default values for the read function will be returned, but the ini file will not actually be created.
 * Please note that you can only have one ini file open at any one time and remember to use ini_close() once you're finished reading/writing from the .ini file as the information is not actually stored to disk until then (it is also stored in memory until the file is closed).
 *
 * @param {String} name The filename for the .ini file
 * @returns {void}
 */
export function ini_open(name) {
  ini_filename = name;
  const raw = localStorage.getItem(name);
  ini_data = raw ? JSON.parse(raw) : {};
  ini_loaded = true;
}

/**
 * This function should be called the moment you are finished reading or writing to any open ini file. If you do not use the function after you have used any of the ini write functions, then nothing will be written to disk, as the file information is held in memory until this function is called, which forces the write. If you try to open an ini without having previously closed another one (or the same one) you will get an error too.

 * The function will also return a string with the ini file encoded into it. This string can then be saved to a server and/or used again along with the function ini_open_from_string() to re-create the ini.
 * 
 * @returns {String}
 */
export function ini_close() {
  if (!ini_filename || !ini_loaded) return;
  localStorage.setItem(ini_filename, JSON.stringify(ini_data));
  ini_parse(JSON.parse(localStorage.getItem(ini_filename)));
}
export function ini_parse(data) {
  let iniText = "";
  for (const section in data) {
    iniText += `[${section}]\r\n`; // newline after section header

    const entries = data[section];
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      iniText += `${key}=${entries[key]}\r\n`;
    }

    iniText += `\r\n`; // extra newline after last key in section
  }
}

/**
 * You can use this function to read a string (text) from an ini data file.
 *
 * @param {String} section The section of the .ini file to read from.
 * @param {String} key The key within the relevant section of the .ini to read from.
 * @param {String} defaultValue The string to return if a string is not found in the defined place (or the .ini does not exist). Must be a string.
 * @returns {String}
 */
export function ini_read_string(section, key, defaultValue) {
  return ini_data?.[section]?.[key] ?? defaultValue;
}

/**
 * You can use this function to read a number from an ini data file.
 *
 * @param {String} section The section of the .ini file to read from.
 * @param {String} key The key within the relevant section of the .ini to read from.
 * @param {Real} defaultValue The value to return if a value is not found in the defined place (or the .ini does not exist). Must be a real number.
 * @returns {Real}
 */
export function ini_read_real(section, key, defaultValue) {
  return parseFloat(ini_read_string(section, key, string(defaultValue))) || 0;
}

/**
 * You can use this function to write a string (text) to an ini data file.
 *
 * @param {String} section The section of the .ini file to write to.
 * @param {String} key The key within the relevant section of the .ini to write to.
 * @param {String} value The string to write to the relevant destination.
 */
export function ini_write_string(section, key, value) {
  if (!ini_data[section]) ini_data[section] = {};
  ini_data[section][key] = string(value);
}

/**
 * You can use this function to write a value (numeric) to an ini data file.
 *
 * @param {String} section The section of the .ini file to write to.
 * @param {String} key The key within the relevant section of the .ini to write to.
 * @param {Real} value The real value to write to the relevant destination.
 */
export function ini_write_real(section, key, value) {
  ini_write_string(section, key, string(value));
}

/**
 * This function checks to see if a section exists in the currently open ini and will return true if it does or false otherwise. This is not a necessary check to prevent errors as, when a section does not exist, reading from a non-existent section will just return a default value, however it can be useful to see if an ini file has saved specific data.
 *
 * @param {String} section The section in the open .ini file to check for.
 * @returns {Boolean}
 */
export function ini_section_exists(section) {
  return ini_data.hasOwnProperty(section);
}

/**
 * This function checks to see if a key exists in the currently open ini and will return true if it does or false otherwise. This is not a necessary check to prevent errors as, when a key does not exist, reading from a non-existent key will just return a default value. It can be useful to see if an ini file has saved specific data and a few other things, however.
 *
 * @param {String} section The section in the open .ini file to check a key in.
 * @param {String} key The key to check for.
 * @returns {Boolean}
 */
export function ini_key_exists(section, key) {
  return ini_data?.[section]?.hasOwnProperty(key) ?? false;
}

/**
 * With this function you can remove the selected key (and its corresponding value) from an ini file.
 *
 * @param {String} section The section to delete  a key from.
 * @param {String} key The key to delete.
 */
export function ini_key_delete(section, key) {
  if (ini_data?.[section]) {
    delete ini_data[section][key];
  }
}

/**
 * With this function you can delete a whole section of an ini file, which will also remove all key-value pairs that are associated with it.
 *
 * @param {String} section The section to delete.
 */
export function ini_section_delete(section) {
  delete ini_data[section];
}

/**
 * (ENGINE EXCLUSIVE) With this function you can export an open .ini file as an ini file openable by GameMaker. The ini file must be opened by ini_open(filename) first.
 *
 * @returns {void}
 */
export function ini_export() {
  if (!ini_filename || !ini_loaded) return;

  ini_parse(ini_data);

  // @ts-ignore
  const blob = new Blob([iniText], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${ini_filename}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * (ENGINE EXCLUSIVE) With this function you can import a .ini file, parse it and store it as filename so this game engine can operate with it, eg. ini_open(filename). The ini file must be valid ini syntax with crlf line endings or else you wont get a valid JSON object out of it.
 *
 * @param {String} iniText The ini text to import to the filename.
 * @param {String} filename The filename that the ini text will be imported to.
 */
export function ini_import(iniText, filename) {
  ini_open(filename);
  const lines = iniText.split(/\r?\n/);
  let currentSection = null;

  if (!ini_data) ini_data = {};

  for (let line of lines) {
    line = line.trim();

    if (!line || line.startsWith(";") || line.startsWith("#")) continue;

    if (line.startsWith("[") && line.endsWith("]")) {
      currentSection = line.slice(1, -1).trim();
      ini_data[currentSection] = {};
    } else if (currentSection && line.includes("=")) {
      let [key, value] = line.split("=");
      key = key.trim();
      value = value.trim();

      // Strip quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      ini_data[currentSection][key] = value;
    }
  }

  // Save to localStorage
  localStorage.setItem(String(filename), JSON.stringify(ini_data));
}

/**
 * This function will return true if the specified file exists and false if it does not. Note that the function can only be used to check local files, but not any files stored on a remote server.
 *
 * @param {String} fname The name of the file to check for
 * @returns {Boolean}
 */
export function file_exists(fname) {
  return localStorage.getItem(fname) !== null;
}

/**
 * Sometimes you want to specify something other than numbers for a random selection, or the numbers you want are not in any real order or within any set range. In these cases you would use choose() to generate a random result. For example, say you want to create an object with a random sprite at the start, then you could use this function to set the sprite index to one of a set of given sprites. Note that you can have as many as you require (note that more arguments will mean that the function will be slower to parse).
 *
 * @param  {...any} args Any type of value(s).
 * @returns {any} One of the given arguments
 */
export function choose(...args) {
  if (args.length === 0) return undefined;
  const index = Math.floor(Math.random() * args.length);
  return args[index];
}

/**
 * With this function you can draw either an outline of a circle or a filled circle.
 *
 * @param {Real} x The x coordinate of the center of the circle.
 * @param {Real} y The y coordinate of the center of the circle.
 * @param {Real} r The circle's radius (length from its center to its edge)
 * @param {Boolean} outline Whether the circle is drawn filled (false) or as a one pixel wide outline (true).
 */
export function draw_circle(x, y, r, outline) {
  context.fillStyle = currentDrawColor;
  context.strokeStyle = currentDrawColor;
  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI, false);
  if (outline) {
    context.stroke();
  } else {
    context.fill();
  }
}

/**
 * This function is used to create a new, empty DS map and will return a Handle to it which is then used to access the data structure in all other DS map functions.
 *
 * @returns {Real}
 */
export function ds_map_create() {
  const id = __ds_map_next_id++;
  __ds_map_store[id] = {};
  return id;
}

/**
 *
 * @param {Real} id The id of the map to check for
 * @param {String} key The key of the value to add.
 * @param {any} val The value to add tothe map.
 */
export function ds_map_add(id, key, val) {
  if (__ds_map_store[id]) {
    __ds_map_store[id][key] = val;
  }
}

/**
 * With this function you can get the value from a specified key. The input values of the function are the (previously created) DS map to use and the key to check for.
 *
 * @param {Real} id The id of the map to use.
 * @param {String} key The key to find.
 * @returns {any} The value of the key (or undefined if it doesnt exist).
 */
export function ds_map_find_value(id, key) {
  const map = __ds_map_store[id];
  if (map && key in map) return map[key];
  return undefined;
}

/**
 * With this function you can easily select a number of characters from within a string to be copied to another one. The first character in a string is always indexed as 1 and not 0 as you may expect, so to copy (for example) the first five characters of string you would have string_copy(str, 1, 5).
 *
 * @param {String} str The string to copy from.
 * @param {Real} index The position of the first character in the string to copy from (numbered from 1)
 * @param {Real} count The number of characters, starting from the position of the first, to copy.
 * @returns {string}
 */
export function string_copy(str, index, count = 1) {
  return str.substring(index - 1, index - 1 + count);
}

/**
 * This function returns the number of characters comprising a given string. It can be useful for things like working out when to limit a custom text entry's character length (e.g.: capping a player's name to 10 characters). Remember that this is different to string_width() in that it measures the number of characters in the string, not its width as drawn on the screen in pixels.
 *
 * @param {String} string The string to measure the number of characters of.
 * @returns {Real}
 */
export function string_length(string) {
  return string.length;
}

/**
 * This function creates a new string from a variety of data types.
 *
 * When only one argument is provided to the function, this argument is considered to be a value, which will be converted to a string from its original data type. When more than one argument is given, the first argument is considered a Format String and the arguments that follow it are considered the values to insert into the format string.
 * Conversion From Non-String Types
 *
 * Values of type Real that are an integer will have no decimal places in the string. Values of type Real that have a fractional part will have two decimal places in the string. If you need more decimal places in the output string you can use the function string_format.
 *
 * Values of type Struct or Instance will be converted to a string using that struct's or instance's toString() Method if one exists, or converted to a string implicitly.
 *
 * Values of type Handle will be converted to a string that shows the handle info:  .
 *
 * Values of type Array will be converted to a string of the format [element1, element2, element3, element4, element5], i.e. the concatenation of all elements in the array. If any of the elements in the array is a struct or an instance then its toString() Method will be called to convert it to a string.
 * Format String
 *
 * When you pass more than one argument to the string function, the first argument will be treated as a format string. In a format string you can use placeholders of the form "{0}", "{1}", "{2}", etc.
 *
 * These placeholders will be replaced with the arguments at the positions they refer to, i.e. "{0}" will be replaced with the second argument, "{1}" will be replaced with the third argument, "{2}" will be replaced with the fourth argument, and so on.
 *
 * string_variable = string("This is a string with two placeholders that will be replaced. They are {0} and {1}.", "this", "that");
 *
 * // Results in:
 *
 * // "This is a string with two placeholders that will be replaced. They are this and that."
 *
 * If you only pass a single argument to the function, then this argument will not be considered a format string. If you add placeholders of the kind "{0}" in this case, then they will be output as normal text as there are no values to replace them with:
 *
 * string_variable = string("This is a string with two placeholders that won't be replaced. They are {0} and {1}.");
 *
 * // Results in:
 *
 * // "This is a string with two placeholders that won't be replaced. They are {0} and {1}."
 *
 * @param {any} value_or_format The value to be turned into a string.
 * @param  {...any} replacements The values to be inserted at the placeholder positions.
 * @returns {String}
 */
export function string(value_or_format, ...replacements) {
  let str = String(value_or_format);

  for (let j = 0; j < replacements.length; j++) {
    // Create a regex for `{j}` with global flag to replace all occurrences
    const pattern = new RegExp(`\\{${j}\\}`, "g");
    str = str.replace(pattern, String(replacements[j]));
  }

  return str;
}

/**
 * This function can be used to return the name of the specified room as a string. Please note that this is only a string and cannot be used to reference the room directly - for that you would need the room index.
 *
 * @param {Real} index The index of the room to check the name of.
 * @returns {String}
 */
export function room_get_name(index) {
  return rooms[index] ?? "";
}

/**
 * This function returns the length of a vector formed by the specified components [x1,y1] and [x2,y2].
 *
 * @param {Real} x1 The x coordinate of the first component of the vector.
 * @param {Real} y1 The y coordinate of the first component of the vector.
 * @param {Real} x2 The x coordinate of the second component of the vector.
 * @param {Real} y2 The y coordinate of the second component of the vector.
 * @returns {Real}
 */
export function point_distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * This function calculates the distance from the edge of the bounding box of the calling instance to the specified x/y position in the room, with the return value being in pixels. Note that if the calling object have no sprite or no mask defined, the results will be incorrect.
 *
 * @param {Real} x The x position to check.
 * @param {Real} y The y position to check.
 * @returns {Real}
 */
export function distance_to_point(x, y) {
  return point_distance(this.x, this.y, x, y);
}

/**
 * Moves the instance towards a given point at a given speed.
 *
 * @param {Real} x The x position of the point to move towards.
 * @param {Real} y The y position of the point to move towards.
 * @param {Real} sp The speed to move at in pixels per second.
 * @returns {void}
 */
export function move_towards_point(x, y, sp) {
  // @ts-ignore
  const dx = x - this.x;
  // @ts-ignore
  const dy = y - this.y;
  const dist = Math.hypot(dx, dy);

  if (dist === 0 || sp === 0) {
    this.speed = 0;
    this.hspeed = 0;
    this.vspeed = 0;
    return;
  }

  this.direction = Math.atan2(-dy, dx) * (180 / Math.PI); // invert Y to match canvas
  this.speed = sp;

  const rad = this.direction * (Math.PI / 180);
  this.hspeed = Math.cos(rad) * sp;
  this.vspeed = -Math.sin(rad) * sp;
}

/**
 * This is the with() help.
 *
 * @param {Targetable} obj The object (or instance) to execute fn as.
 * @param {Script} fn The function to execute as obj. Must not be an arrow function (must not be () => {}).
 */
export function _with(obj, fn) {
  try {
    if (fn.prototype === undefined) {
      throw new Error("_with: callback must not be an arrow function");
    }

    if (typeof obj !== "object") {
      throw new Error("_with: object must be an object");
    }

    // @ts-expect-error
    if (obj._object) {
      // @ts-expect-error
      if (this) obj.other = this;
      fn.call(obj);
      // @ts-expect-error
      obj.other = undefined;
      return;
    }

    const instancesOfObj = instances.get(obj) || [];
    for (const inst of instancesOfObj) {
      if (this) inst.other = this;
      fn.call(inst);
      inst.other = undefined;
      return;
    }
  } catch (error) {
    // @ts-expect-error
    console.error(`with() error on object ${obj?.name || "[unknown]"}`, error);
  }
}

/**
 * This function returns the absolute value of the input argument, so if it's a positive value then it will remain the same, but if it's negative it will be multiplied by -1 to make it positive.
 * 
 * @param {Real} val The number to turn absolute.
 * @returns {Real}
 */
export function abs(val) {
  return Math.abs(val);
}

/**
 * Deprecated GM1.x function. Please use this.direction and this.speed instead.
 *
 * @param {String} direction Direction to move the instance to
 * @param {Real} speed Speed to move the instance at
 */
export function action_move(direction, speed) {
  const directions = [225, 270, 315, 180, null, 0, 135, 90, 45];

  const index = direction.indexOf("1");

  if (index === -1 || directions[index] === null || speed === 0) {
    this.speed = 0;
    this.hspeed = 0;
    this.vspeed = 0;
    this.direction = 0;
    return;
  } else {
    this.direction = directions[index];
    this.speed = speed;
    const rad = (this.direction * Math.PI) / 180;
    this.hspeed = Math.cos(rad) * speed;
    this.vspeed = -Math.sin(rad) * speed;
  }
}

/**
 * With this function you can resume any sound that is currently paused (after using the function audio_pause_sound()). The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be re-started.
 *
 * @param {Sound} index The index of the sound to resume.
 * @returns {void}
 */
export function audio_resume_sound(index, id = null) {
  id = id ?? index?._sounds?.[0]?._id;
  if (id !== null && id !== undefined) index.play(id);
  if (global.currentsong === index) {
    global.playing1 = true;
  }
  if (global.currentsong2 === index) {
    global.playing2 = true;
  }
}

/**
 * With this function you can pause any sound that is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be paused.
 *
 * @param {Sound} index The index of the sound to pause.
 * @returns {void}
 */
export function audio_pause_sound(index, id = null, currentsong) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) index.pause(id);
  if (currentsong === 1) {
    global.playing1 = false;
  }
  if (currentsong === 2) {
    global.playing2 = false;
  }
}

/**
 * All instances have a unique identifier (id) which can be used to modify and manipulate them while a game is running, but you may not always know what the id for a specific instance is and so this function can help as you can use it to iterate through all of them to find what you need. You specify the object that you want to find the instance of and a number, and if there is an instance at that position in the instance list then the function returns the id of that instance, and if not it returns the special keyword noone. You can also use the keyword all to iterate through all the instances in a room, as well as a parent object to iterate through all the instances that are part of that parent / child hierarchy, and you can even specify an instance (if you have its id) as a check to see if it actually exists in the current room. Please note that as instances are sorted in an arbitrary manner, there is no specific order to how the instances are checked by this function, and any instance can be in any position.
 *
 * @param {Obj} obj The object to find the nth instance of
 * @param {Real} n The number of the instance to find
 * @returns {Instance} The instance (or null if none)
 */
export function instance_find(obj, n) {
  try {
    if (n < 0) {
      throw new Error(`instance_find: number ${n} is less than 0.`);
    }

    const result = [];

    for (const list of instances.values()) {
      for (const inst of list) {
        let current = inst._object;
        while (current) {
          if (current === obj) {
            result.push(inst);
            break;
          }
          current = current.parent;
        }
      }
    }

    if (n < result.length) {
      return result[n];
    } else {
      throw new Error(`instance_find: index ${n} out of range for object`);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * You can use this function to change one instance of an object into another instance of a different object, and while doing so decide whether to perform the initial instances Destroy and Clean Up Events and the new instances Create Event. In this way, you can have (for example) a bomb change into an explosion - in which case the "perf" argument would probably be true as you would want the bomb to perform its Destroy Event and Clean Up Event, as well as the explosion to perform its Create Event - or you could have your player character change into a different one - in which case the "perf" argument would probably be false as you do not want the instances to perform their Create and Destroy/Clean Up events.
 *
 * @param {Obj} obj The new object the calling object will change into.
 * @param {Boolean} perf Whether to perform that new object's Create and Destroy events (true) or not (false).
 */
export function instance_change(obj, perf) {
  try {
    if (!obj || typeof obj !== "object") {
      throw new Error(`instance_change: invalid object ${obj}`);
    }

    const inst = this;
    // @ts-ignore
    const x = inst.x ?? 0;
    // @ts-ignore
    const y = inst.y ?? 0;

    let newInstance;

    if (perf) {
      newInstance = instance_create(x, y, obj);
    } else {
      // Silent instance creation without calling create2/roomStart
      if (typeof obj.create !== "function") {
        throw new Error("instance_change: obj has no create() method");
      }

      newInstance = obj.create();
      if (!newInstance) {
        throw new Error(
          "instance_change: obj.create() returned null/undefined"
        );
      }

      newInstance._object = obj;

      newInstance.x = x;
      newInstance.y = y;
      newInstance.startx = x;
      newInstance.starty = y;
      newInstance.xstart = x;
      newInstance.ystart = y;
      newInstance.previousx = x;
      newInstance.previousy = y;
      newInstance.xprevious = x;
      newInstance.yprevious = y;

      if (!instances.has(obj)) {
        instances.set(obj, []);
      }
      instances.get(obj).push(newInstance);
    }

    // Remove old instance from instances map
    // @ts-ignore
    const oldObj = inst._object;
    const list = instances.get(oldObj);
    if (Array.isArray(list)) {
      const i = list.indexOf(inst);
      if (i !== -1) list.splice(i, 1);
    }

    // Handle destroy and cleanup if perf is true
    if (perf) {
      // @ts-expect-error
      inst.destroy?.call(inst);
      // @ts-expect-error
      inst.cleanUp?.call(inst);
    }

    inst._destroyed = true;

    return newInstance;
  } catch (e) {
    console.error(e);
  }
}

/**
 * This function tells the calling instance to start the given path. The path started by the instance is stored in the variable path_index. A path is created from a series of defining points that are linked together and then used to plan the movements of an instance. They can be created with code, or in Paths and they are assigned to an instance to use in the game. You would then use this function to tell your instance which path to follow, what speed to follow the path (measured in pixels per step), how to behave when it reaches the end of the path, and whether to follow the absolute or relative path position. This last part means that it either starts and follows the path exactly as you designed and placed it in Paths (absolute), or it starts and follows the path from the position at which the instance was created (relative).
 *
 * @param {PathAsset} path The path index to start.
 * @param {Real} speed The speed of which to follow the path in pixels per step, negative meaning going backwards.
 * @param {String} endaction What to do when the end of the path is reached.
 * @param {Boolean} absolute Whether the calling instance should follow the absolute path as it is defined in Paths (true) or a relative path to its current position (false).
 */
export function path_start(path, speed, endaction, absolute) {
  try {
    if (
      typeof this === "undefined" ||
      typeof path !== "object" ||
      typeof speed !== "number" ||
      typeof endaction !== "string" ||
      typeof absolute !== "boolean" ||
      (typeof absolute === "number" && (absolute !== 1 || absolute !== 0))
    ) {
      throw new Error("path_start: invalid arguments");
    }

    const firstPoint = path.points[1];
    if (!firstPoint) {
      throw new Error("path_start: path has no starting point");
    }

    if (absolute) {
      this.x = firstPoint.x;
      this.y = firstPoint.y;
    }

    this._path = {
      data: path,
      index: 1,
      speed,
      endaction,
      absolute,
    };

    this.initialspeed = speed;
  } catch (error) {
    console.error(error);
  }
}

/**
 * This function will return the width (in pixels) of the input string, taking into account any line-breaks the text may have. It is very handy for calculating distances between text elements based on the total width of the letters that make up the string as it would be drawn with draw_text() using the currently defined font.
 *
 * @param {String} string The string to measure the width of
 * @returns {Real}
 */
export function string_width(string, second = 0) {
  let font;
  if (second === 0) font = currentFont;
  if (second === 1) font = secondFont;
  if (second === 2) font = thirdFont;
  if (!font) return;
  let width = 0;

  for (const char of string) {
    const glyph = font.glyphs[char];
    if (!glyph) {
      width += font.size; // fallback spacing for missing glyphs
      continue;
    }

    width += glyph.shift ?? glyph.w + (glyph.offset || 0);
  }

  return width;
}

/**
 * This function opens the text file with the indicated filename for reading only, returning the unique id of the file that which should be stored in a variable as it will be used for all further actions to do with that file. If the file does not exists then the function will return the value -1.
 *
 * @param {String} fname The name of the file to read from.
 * @returns {File}
 */
export function file_text_open_read(fname) {
  let file = {};
  let fileData = {};
  for (let i = 0; i < text_read.length; i++) {
    if (text_total[31].name !== null) {
      break;
    }
    if (
      (text_read[i].name === null && text_data[i].name === null) ||
      (text_read[i].name === fname && text_data[i].name === fname)
    ) {
      text_read[i].name = fname;
      text_data[i].name = fname;
      file = text_read[i];
      fileData = text_data[i];
      text_read_line[i].name = fname;
      text_read_line[i].line = 0;
      text_loaded[i].loaded = true;
      text_loaded[i].name = fname;
      text_total[i].name = fname;
      break;
    }
  }
  if (!file || !fileData) {
    console.warn("no file available to open (close some files and try again)");
    return null;
  }
  file.name = fname;
  fileData.name = fname;
  if (!fileData.data && localStorage.getItem(fname))
    fileData.data = localStorage.getItem(fname);
  // @ts-expect-error
  else return -1;
  // @ts-expect-error
  return file;
}

/**
 * This function opens the text file with the indicated filename for writing only (if the file does not exist, it is created), returning the unique id of the file that which should be stored in a variable as it will be used for all further actions to do with that file.
 *
 * @param {String} fname The name of the file to write to
 * @returns {File}
 */
export function file_text_open_write(fname) {
  let file = null;
  let fileData = null;
  for (let i = 0; i < text_read.length; i++) {
    if (text_total[31].name !== null) {
      break;
    }
    if (
      (text_write[i].name === null && text_data[i].name === null) ||
      (text_write[i].name === fname && text_data[i].name === fname)
    ) {
      text_write[i].name = fname;
      text_data[i].name = fname;
      file = text_write[i];
      fileData = text_data[i];
      text_write_line[i].name = fname;
      text_write_line[i].line = 0;
      text_loaded[i].loaded = true;
      text_loaded[i].name = fname;
      text_total[i].name = fname;
      break;
    }
  }
  if (!file || !fileData) {
    console.error("no file available to open (close some files and try again)");
    return null;
  }
  file.name = fname;
  fileData.name = fname;
  if (localStorage.getItem(fname)) fileData.data = localStorage.getItem(fname);
  else localStorage.setItem(fname, fileData.data);
  // @ts-expect-error
  return file;
}

/**
 * With this function you can read a real number value from a text file and the function returns that value to be used or stored in a variable.
 *
 * @param {ID} fileid The id of the file to read from.
 * @returns {Real}
 */
export function file_text_read_real(fileid) {
  return parseInt(file_text_read_string(fileid)) || 0;
}

/**
 * With this function you can read a string from a text file and the function returns that value to be used or stored in a variable.
 *
 * @param {ID} fileid The id of the file to read from.
 * @returns {String}
 */
export function file_text_read_string(fileid) {
  if (typeof fileid !== "object") return;

  function getPos(str, substr, index) {
    return str.split(substr, index).join(substr).length;
  }

  let file = null;
  let fileData = null;
  let fileLine = 0;
  let str = "";
  for (let i = 0; i < text_read.length; i++) {
    // @ts-expect-error
    if (text_read[i] === fileid) {
      file = text_read[i];
      fileData = text_data[i];
      fileLine = text_read_line[i].line;
      break;
    }
  }

  if (!file || !fileData) return;

  if (fileLine === 0) {
    for (let i = 0; i < fileData.data.length; i++) {
      if (fileData.data[i] !== "\r" && fileData.data[i + 1] !== "\n") {
        str = str.concat("", fileData.data[i]);
      } else {
        break;
      }
    }
  } else {
    for (
      let i = getPos(fileData.data, "\r\n", fileLine) + 2;
      i < fileData.data.length;
      i++
    ) {
      if (fileData.data[i] !== "\r" && fileData.data[i + 1] !== "\n") {
        str = str.concat("", fileData.data[i]);
      } else {
        break;
      }
    }
  }
  return str;
}

/**
 * With this function you can skip the remainder of the current line from a given opened text file and move to the start of the next one. The function will also return the full line as a string, making it an easy way to read complete "chunks" of data for parsing later.
 *
 * @param {ID} fileid The id of the file to read from.
 * @returns {string}
 */
export function file_text_readln(fileid) {
  if (typeof fileid !== "object") return;

  function getPos(str, substr, index) {
    return str.split(substr, index).join(substr).length;
  }

  let file = null;
  let fileData = null;
  let fileLine = 0;
  let index = 0;
  let str = "";
  for (let i = 0; i < text_read.length; i++) {
    // @ts-expect-error
    if (text_read[i] === fileid) {
      file = text_read[i];
      fileData = text_data[i];
      fileLine = text_read_line[i].line;
      index = i;
      break;
    }
  }

  if (!file || !fileData) return;

  if (fileLine === 0) {
    for (let i = 0; i < fileData.data.length; i++) {
      if (fileData.data[i] !== "\r" && fileData.data[i + 1] !== "\n") {
        str = str.concat("", fileData.data[i]);
      } else {
        fileLine++;
        break;
      }
    }
  } else {
    for (
      let i = getPos(fileData.data, "\r\n", fileLine) + 2;
      i < fileData.data.length;
      i++
    ) {
      if (fileData.data[i] !== "\r" && fileData.data[i + 1] !== "\n") {
        str = str.concat("", fileData.data[i]);
      } else {
        fileLine++;
        break;
      }
    }
  }

  text_read_line[index].line = fileLine;
  return str;
}

/**
 * With this function you can write a number to the previously opened text file. Note that as the value to be written can be a real number, all decimals will be written with a "." point as separator. If the file already contains information, this information will be erased and the string will be written at the beginning of the file, or at the file's current line.
 *
 * @param {ID} fileid The id of the file to edit.
 * @param {Real} val The real value to write to the file.
 */
export function file_text_write_real(fileid, val) {
  file_text_write_string(fileid, string(val));
}

/**
 * With this function you can write a string to a previously opened text file. If the file already contains information, this information will be erased and the string will be written at the beginning of the file, or at the file's current line.
 *
 * @param {ID} fileid The id of the file to edit.
 * @param {String} str The string to write to the file.
 * @returns {Real}
 */
export function file_text_write_string(fileid, str) {
  if (typeof fileid !== "object") return undefined;

  let fileData = null;
  let fileLine = 0;
  for (let i = 0; i < text_write.length; i++) {
    // @ts-expect-error
    if (text_write[i] === fileid) {
      fileData = text_data[i];
      fileLine = text_write_line[i].line;
      break;
    }
  }

  if (!fileData) return;

  let lines = fileData.data ? fileData.data.split("\r\n") : [];

  while (lines.length <= fileLine) lines.push("");

  lines[fileLine] = str;

  fileData.data = lines.join("\r\n");
}

/**
 * With this function you can write a new line to an opened text file. In this way you can skip lines or write information on a line by line basis.
 *
 * @param {ID} fileid The id of the file to edit.
 * @returns {Real}
 */
export function file_text_writeln(fileid) {
  if (typeof fileid !== "object") return;

  for (let i = 0; i < text_write.length; i++) {
    // @ts-expect-error
    if (text_write[i] === fileid) {
      text_write_line[i].line++;
      break;
    }
  }
}

/**
 * Once you have finished working with a given file (whether reading from it or writing to it), you must close the file again, or else you risk losing the information contained within. This also prevents memory leaks and makes sure that you never go over the file limit by having more than 32 files open.
 *
 * @param {File} fileid The id of the file to close.
 * @returns {void}
 */
export function file_text_close(fileid) {
  if (typeof fileid !== "object" || fileid === null) return;
  let fileData = null;
  let index = 0;
  for (let i = 0; i < text_total.length; i++) {
    if (text_read[i] == fileid || text_write[i] == fileid) {
      fileData = text_data[i];
      text_read_line[i].name = null;
      text_write_line[i].name = null;
      text_read_line[i].line = 0;
      text_write_line[i].line = 0;
      text_loaded[i].loaded = false;
      text_loaded[i].name = null;
      index = i;
      break;
    }
    if (text_total[i].name === fileid.name) {
      text_total[i].name = null;
    }
  }

  if (!fileData) {
    console.error("file", fileid.name, "not opened");
    return;
  }
  localStorage.setItem(fileid.name, fileData.data);

  text_read[index].name = null;
  text_write[index].name = null;
  text_data[index].name = null;
  text_data[index].data = "";
}

/**
 * (ENGINE EXCLUSIVE) With this function you can import a text file and store it as filename so this game engine can operate with it, eg. file_text_open_read(filename). The text file must have crlf line endings or else you wont be able to operate file_text_readln() actions on it.
 *
 * @param {string} data The text data to import to the filename.
 * @param {string} filename The filename that the ini text will be imported to.
 */
export function file_text_import(data, filename) {
  localStorage.setItem(filename, data);
}

/**
 * (ENGINE EXCLUSIVE) With this function you can export a text file with the name filename as a crlf line ending text file openable by GameMaker.
 *
 * @returns {void}
 */
export function file_text_export(filename) {
  const data = localStorage.getItem(filename);
  if (!data) return;

  const blob = new Blob([data], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * With this function you can draw any given tile from a tile set - compete with rotations, flips and mirrors - setting the frame (if animated) and the position within the room. The tile set ID value is the tile set index as set in the IDE and the tile data is the data "blob" that contains all the information about the tile index and the transformations that have been applied.
 *
 * @param {Tileset} tileset The ID of the tile set to use
 * @param {TileData} tiledata The tile data to use
 * @param {Real} frame The frame number for the animated tile to use (default 0 for non-animated tiles)
 * @param {Real} x The x position within the room to draw at.
 * @param {Real} y The y position within the room to draw at.
 * @returns {Real}
 */
export function draw_tile(tileset, tiledata, frame, x, y) {
  if (!tileset || !tiledata) return;

  const {
    sprite,
    width: tilew,
    height: tileh,
    xoffset = 0,
    yoffset = 0,
    xsep = 0,
    ysep = 0,
    xbord = 0,
    ybord = 0,
    gms2 = 0,
  } = tileset;

  // Load the tileset image
  const key = `/bg/${sprite}.png`;
  const cached = loadImageCached(key, spriteCache);
  if (!cached.loaded) return;

  const img = cached.img;

  // Calculate columns in the tileset image
  const columns = Math.floor((img.width - xbord * 2 + xsep) / (tilew + xsep));

  // GameMaker Studio 2 has a blank tile at the top-left (tile index starts at 1)
  let tile_index = tiledata.tile_index + (frame || 0);
  if (gms2) tile_index += 1;

  const col = tile_index % columns;
  const row = Math.floor(tile_index / columns);

  const sx = xbord + col * (tilew + xsep);
  const sy = ybord + row * (tileh + ysep);

  context.save();

  // Apply position and offset
  context.translate(x - xoffset, y - yoffset);

  // Handle flipping
  if (tiledata.hflip || tiledata.vflip) {
    context.scale(tiledata.hflip ? -1 : 1, tiledata.vflip ? -1 : 1);
    context.translate(tiledata.hflip ? -tilew : 0, tiledata.vflip ? -tileh : 0);
  }

  // Draw the tile image
  context.drawImage(
    img,
    sx,
    sy,
    tilew,
    tileh, // source
    0,
    0,
    tilew,
    tileh // destination
  );

  context.restore();
}

/**
 * Calling this function will end the current path that the instance is following, as set when the function path_start() was called..
 */
export function path_end() {
  this._path.data = {};
}

/**
 * GameMaker provides this function (as well as others) to permit the user to make their own colours. This particular function takes three component parts, the hue, the saturation and the value (also know as "luminosity") to create the colour desired. These values are taken as being between 0 and 255 so you can make 16,777,216 (256*256*256) colours with this!
 *
 * @param {Real} hue The hue of the colour
 * @param {Real} sat How saturated the colour is
 * @param {Real} val How dark the colour is
 * @returns {string} A hex code representing the color
 */
export function make_colour_hsv(hue, sat, val) {
  let red, green, blue;
  if (sat === 0) {
    red = green = blue = val;
  } else {
    let chroma = val * sat;
    let hueSection = hue / 60;
    let secComp = chroma * (1 - abs((hueSection % 2) - 1));
    let match = val - chroma;

    let rPrime, gPrime, bPrime;

    if (0 <= hue && hue < 60) {
      rPrime = chroma;
      gPrime = secComp;
      bPrime = 0;
    } else if (60 <= hue && hue < 120) {
      rPrime = secComp;
      gPrime = chroma;
      bPrime = 0;
    } else if (120 <= hue && hue < 180) {
      rPrime = 0;
      gPrime = chroma;
      bPrime = secComp;
    } else if (180 <= hue && hue < 240) {
      rPrime = 0;
      gPrime = secComp;
      bPrime = chroma;
    } else if (240 <= hue && hue < 300) {
      rPrime = secComp;
      gPrime = 0;
      bPrime = chroma;
    } else if (300 <= hue && hue < 360) {
      rPrime = chroma;
      gPrime = 0;
      bPrime = secComp;
    }

    red = Math.round((rPrime + match) * 255);
    green = Math.round((gPrime + match) * 255);
    blue = Math.round((bPrime + match) * 255);
  }

  function toHex(value) {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toLowerCase();
}

/**
 * This will return the value of a number multiplied by itself "n" number of times. For example, power(5,3) will multiply 5 by itself 3 times and return 125, which is the same as saying 5*5*5=125. Please note that the "x" value (the number to change) cannot be a negative value.
 *
 * @param {Real} x The number to change.
 * @param {Real} n How many times to multiply x by itself.
 * @returns {Real}
 */
export function power(x, n) {
  try {
    if (x < 0 && !Number.isInteger(n))
      throw new Error(
        `power(${x}, ${n}): x cannot be negative while n is fractional`
      );
    return Math.pow(x, n);
  } catch (e) {
    console.error(e);
    return NaN;
  }
}

/**
 * This function creates a new surface and returns it.
 *
 * When the surface is first created, it may contain "noise" as basically it is just an area of memory that is put aside for the purpose (and that memory may still contain information), so you may want to clear the surface before use with a function like draw_clear_alpha(). this will never happen here as the browser automatically manages memory but you should still do that just in case
 *
 * @param {Real} w The width of the surface to be created
 * @param {Real} h The height of the surface to be created
 * @returns {SurfaceId}
 */
export function surface_create(w, h) {
  try {
    const surfCanvas = document.createElement("canvas");
    surfCanvas.width = w;
    surfCanvas.height = h;

    const surfContext = surfCanvas.getContext("2d");
    surfContext.imageSmoothingEnabled = false;

    const id = surfaceIdCounter++;
    surfaces[id] = { canvas: surfCanvas, context: surfContext };
    document.getElementsByTagName("body")[0].appendChild(canvas);
    return id;
  } catch (e) {
    console.error("surface_create error:", e);
    return -1;
  }
}

/**
 * This function simply returns the width, in pixels, of the indexed surface. It should be noted that if you call this to check the application_surface immediately after having changed its size using surface_resize() it will not return the new value as the change needs a step or two to be fully processed. After waiting a step it should return the new size correctly.
 *
 * @param {SurfaceId} surface_id	The ID of the surface to get the width of.
 * @returns {Real}
 */
export function surface_get_width(surface_id) {
  if (typeof surface_id !== "number") {
    if (surface_id === "application_surface") return surfaces[-1].canvas.width;
    else return 0;
  }
  const surf = surfaces[surface_id];
  if (!surf) return 0;
  return surf.canvas.width;
}

/**
 * This function simply returns the height, in pixels, of the given surface.
 *
 * It should be noted that if you call this to check the application_surface immediately after having changed its size using surface_resize, it will not return the new value as the change needs a step or two to be fully processed. After waiting a step it should return the new size correctly.
 *
 * @param {SurfaceId} surface_id The surface to get the height of.
 * @returns {Real}
 */
export function surface_get_height(surface_id) {
  if (typeof surface_id !== "number") {
    if (surface_id === "application_surface") return surfaces[-1].canvas.height;
    else return 0;
  }
  const surf = surfaces[surface_id];
  if (!surf) return 0;
  return surf.canvas.height;
}

/**
 * This function sets all further drawing to the target surface rather than the screen. In this way you can tell GameMaker to only draw specific things to the specified surface.
 *
 * @param {SurfaceId} surface_id The surface to set as the drawing target.
 * @returns {Boolean} Whether the render target was set successfully
 */
export function surface_set_target(surface_id) {
  try {
    const surf = surfaces[surface_id];
    if (!surf)
      throw new Error(
        `surface_set_target(${surface_id}): surface ${surface_id} is not a valid surface`
      );
    context = surf.context;
    currCanvas = surf.canvas;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * This function resets all further drawing from the current surface back to the previous draw target.
 *
 * The previous target can be another surface (the application surface, a view surface, a custom surface) or the display buffer, depending on where the call to the corresponding surface_set_target() was made. See: Draw Targets
 *
 * @returns {Boolean} Whether the render target was reset successfully
 */
export function surface_reset_target() {
  try {
    context = ctx;
    currCanvas = canvas;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * This function draws a surface at a given position within the room, with the top left corner of the surface being drawn at the specified x/y position.
 *
 * @param {SurfaceId} id The surface to draw.
 * @param {Real} x The x position of where to draw the surface.
 * @param {Real} y The y position of where to draw the surface
 * @returns {void}
 */
export function draw_surface(id, x, y) {
  draw_surface_ext(id, x, y, 1, 1, 0, c_white, 1);
}

/**
 * This function draws the given surface as in the function draw_surface(), with additional options to change the scale, blending, rotation and alpha of the surface being drawn.
 *
 * @param {SurfaceId} id The surface to draw.
 * @param {Real} x The x position of where to draw the surface.
 * @param {Real} y The y position of where to draw the surface
 * @param {Real} xscale The horizontal scale.
 * @param {Real} yscale The vertical scale.
 * @param {Real} rot The rotation or angle to draw the surface.
 * @param {Colour} col The colour with which to blend the surface.
 * @param {Real} alpha The alpha transparency for drawing the surface.
 * @returns {void}
 */
export function draw_surface_ext(id, x, y, xscale, yscale, rot, col, alpha) {
  try {
    if (
      typeof id !== "number" ||
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof xscale !== "number" ||
      typeof yscale !== "number" ||
      typeof rot !== "number" ||
      typeof col !== "string" ||
      typeof alpha !== "number"
    )
      throw new Error(
        `draw_surface_ext(${id}, ${x}, ${y}, ${xscale}, ${yscale}, ${rot}, ${col}, ${alpha}): invalid parameters.`
      );
    const surf = surfaces[id];
    if (!surf)
      throw new Error(
        `draw_surface_ext(${id}, ${x}, ${y}, ${xscale}, ${yscale}, ${rot}, ${col}, ${alpha}): surface ${id} not valid.`
      );

    const img = surf.canvas;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(xscale, yscale);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    if (col.toLowerCase() !== c_white) {
      const tintCanvas = document.createElement("canvas");
      tintCanvas.width = img.width;
      tintCanvas.height = img.height;

      const tintCtx = tintCanvas.getContext("2d");
      tintCtx.drawImage(img, 0, 0);

      tintCtx.globalCompositeOperation = "multiply";
      tintCtx.fillStyle = col;
      tintCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height);

      tintCtx.globalCompositeOperation = "destination-in";
      tintCtx.drawImage(img, 0, 0);

      ctx.drawImage(tintCanvas, 0, 0);
    } else {
      ctx.drawImage(img, 0, 0);
    }
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * This function frees a surface from memory.
 *
 * When you are working with surfaces, you should always use this function whenever you are finished using them. Surfaces take up space in memory and so need to be removed, normally at the end of a room, but it can be done at any time depending on the use you put them to. Failure to do so can cause memory leaks which will eventually slow down and crash the page/browser.
 *
 * @param {SurfaceId} id The surface to be freed.
 * @returns {void}
 */
export function surface_free(id) {
  try {
    if (typeof id !== "number") {
      if (id === "application_surface")
        throw new Error("surface_free: tried to free application_surface");
    }
    if (id === -1) {
      throw new Error("surface_free: tried to free application_surface");
    }

    if (context === surfaces[id].context || canvas === surfaces[id].canvas) {
      console.warn(
        "freeing surface currently set for drawing. resetting surface target"
      );
      surface_reset_target();
    }
    surfaces[id] = undefined;
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * This function can be used to clear the entire screen (with no alpha blend) to the given colour, and is only for use in the draw event of an instance (it will not show if used in any other event). It can also be useful for clearing surfaces when they are newly created.
 *
 * @param {Colour} col The colour with which the screen will be cleared.
 * @return {void}
 */
export function draw_clear(col) {
  draw_clear_alpha(col, 1);
}

/**
 * This function can be used to clear the entire screen with a given colour and the alpha component of the destination is set to the value you have set - this function does not do any blending as it works but any subsequent blend operations can be set up to use the destination alpha that you have set. This is only for use in the draw event of an instance (it will not show if used in any other event), and it can also be very useful for clearing surfaces when they are newly created.
 *
 * It is worth noting that when using the HTML5 module, you can use this function to make the canvas background transparent, which will then permit any images being used in the host HTML to be seen with the game running over them. To achieve this effect you must first go into the room editor and remove any Background Layers from the Room Editor, then untick the option Clear View Background found on the View Properties. Finally, you will need to make a new object, place it in the first room of the game, and assign it a very high depth (for example, 10000). Then in the Pre Draw event use this function to set the canvas alpha to the colour and transparency that you wish it to have.
 *
 * @param {Colour} col The colour with which the screen will be cleared
 * @param {Real} alpha The transparency of the colour with which the screen will be  cleared
 * @return {void}
 */
export function draw_clear_alpha(col, alpha) {
  const oldColor = currentDrawColor;
  const oldAlpha = context.globalAlpha;
  context.fillStyle = col;
  context.globalAlpha = alpha;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = oldColor;
  context.globalAlpha = oldAlpha;
}

/**
 * GameMaker provides this function (as well as others) to permit the user to make their own colours. This particular function takes three component parts, the red, the green and the blue components of the colour that you wish to make. These values are taken as being between 0 and 255 so you can make 16,777,216 (256*256*256) colours with this! Below you can see an image of how these components look when separated:
 *
 * @param {Real} red The red component of the colour
 * @param {Real} green The green component of the colour
 * @param {Real} blue The blue component of the colour
 * @returns {string}
 */
export function make_colour_rgb(red, green, blue) {
  function toHex(value) {
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toLowerCase();
}

/**
 * This function creates a new buffer and returns it.
 *
 * The function allocates a portion of memory for the buffer, which can then be used to store different types of data (specified when you write to the buffer using the buffer_write(), buffer_poke() or buffer_fill() function).
 *
 * @param {Real} size The size (in bytes) of the buffer.
 * @param {String} type The type of buffer to create.
 * @param {Real} alignment The byte alignment for the buffer
 * @returns {Buffer}
 */
export function buffer_create(size, type, alignment) {
  return createBuffer(size, type, alignment);
}

/**
 * This function deletes a buffer previously created using buffer_create() from memory, releasing the resources used to create it and removing any data that it may currently contain.
 *
 * @param {Buffer} buf The buffer to delete.
 */
export function buffer_delete(buf) {
  // JS garbage collector handles this, but let's null refs for safety
  buf.data = null;
  buf.dv = null;
  buf.size = 0;
  buf.pos = 0;
}

/**
 * This function moves the seek position of a buffer, setting it relative to the start, end or current seek position (that which was last used when reading or writing data).
 *
 * The seek position is the offset (in bytes) from the start of the buffer where new values are written, and from where values are read. It also moves automatically when you read from or write to a buffer.
 *
 * @param {Buffer} buffer The buffer to use.
 * @param {Real} base The base position to seek.
 * @param {Real} offset The data offset value.
 */
export function buffer_seek(buffer, base, offset) {
  try {
    let orig = 0;
    switch (base) {
      case SEEK.start:
        orig = 0;
        break;
      case SEEK.current:
        orig = buffer.pos;
        break;
      case SEEK.end:
        orig = buffer.size;
        break;
      default:
        throw new Error(`Invalid origin ${orig}`);
    }
    const newPos = orig + offset;
    if (newPos < 0 || newPos > buffer.size) {
      throw new Error(`buffer_seek out of range: ${newPos}`);
    }
    buffer.pos = newPos;
    return newPos;
  } catch (e) {
    console.error(e);
    return -1;
  }
}

/**
 * This function gets the current "seek" position for use in other buffer functions.
 *
 * When you read or write data to a buffer using the buffer_read() or buffer_write() functions, the current "seek" position is advanced by the bytes written or read. For example, if your buffer alignment is set to 4 bytes and you write a single piece of data which is 1 byte in size then do a buffer_tell(), you'll get a return value of 1. However, if you write another piece of data, also 1 byte in size, then do a buffer_tell(), you'll get a return value of 5 as the alignment has "padded" the data to that position.
 *
 * To change the seek value of a buffer, use buffer_seek().
 *
 * @param {Buffer} buffer The buffer to use.
 * @returns {Real}
 */
export function buffer_tell(buffer) {
  try {
    return buffer.pos;
  } catch (e) {
    console.error(e);
    return -1;
  }
}

/**
 * This function resizes a given buffer to the size (in bytes) that you specify.
 *
 * @param {Buffer} buffer The buffer to change the size of
 * @param {Real} newsize The new size of the buffer (in bytes).
 */
export function buffer_resize(buffer, newsize) {
  if (newsize === buffer.size) return;

  const newAb = new ArrayBuffer(newsize);
  const newUint8 = new Uint8Array(newAb);
  const oldUint8 = new Uint8Array(buffer.data);
  newUint8.set(oldUint8.subarray(0, Math.min(newsize, buffer.size)));

  buffer.data = newAb;
  buffer.dv = new DataView(newAb);
  buffer.size = newsize;
  if (buffer.pos > newsize) buffer.pos = newsize;
}

/**
 * This function can be used to write data to a previously created buffer. The data you write must be in agreement with the "type" argument of this function, meaning that you can't try to write a string as an unsigned 16bit integer, for example.
 *
 * The function will write your given value at the buffer's current seek position.
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {BufferType} type The type of data to be written to the buffer (see the list of constants above).
 * @param {any} value The data to write.
 */
export function buffer_write(buffer, type, value) {
  try {
    const dv = buffer.dv;
    let pos = buffer.pos;
    const fmt = type.replace("buffer_", "");

    switch (fmt) {
      case "u8":
        dv.setUint8(pos, value >>> 0);
        pos += 1;
        break;
      case "s8":
        dv.setInt8(pos, value | 0);
        pos += 1;
        break;
      case "u16":
        dv.setUint16(pos, value >>> 0, true);
        pos += 2;
        break;
      case "s16":
        dv.setInt16(pos, value | 0, true);
        pos += 2;
        break;
      case "u32":
        dv.setUint32(pos, value >>> 0, true);
        pos += 4;
        break;
      case "s32":
        dv.setInt32(pos, value | 0, true);
        pos += 4;
        break;
      case "u64": {
        // Emulate 64-bit write with BigInt
        const big = BigInt(value);
        const lo = Number(big & 0xffffffffn);
        const hi = Number((big >> 32n) & 0xffffffffn);
        dv.setUint32(pos, lo, true);
        dv.setUint32(pos + 4, hi, true);
        pos += 8;
        break;
      }
      case "f16": {
        const f16 = float32ToFloat16(Number(value));
        dv.setUint16(pos, f16, true);
        pos += 2;
        break;
      }
      case "f32":
        dv.setFloat32(pos, Number(value), true);
        pos += 4;
        break;
      case "f64":
        dv.setFloat64(pos, Number(value), true);
        pos += 8;
        break;
      case "bool":
        dv.setUint8(pos, value ? 1 : 0);
        pos += 1;
        break;
      case "string": {
        const encoded = encodeUTF8(String(value));
        for (let i = 0; i < encoded.length; i++) {
          dv.setUint8(pos++, encoded[i]);
        }
        dv.setUint8(pos++, 0); // null terminator
        break;
      }
      case "text": {
        const encoded = encodeUTF8(String(value));
        for (let i = 0; i < encoded.length; i++) {
          dv.setUint8(pos++, encoded[i]);
        }
        break;
      }
      default:
        throw new Error(`buffer_write: unknown type '${type}'`);
    }

    buffer.pos = pos;
  } catch (e) {
    console.error(e);
  }
}

/**
 * This function reads a piece of data of the given type from the given buffer at the buffer's current seek position.
 *
 * After the function has executed the seek position is advanced by the number of bytes read. The next buffer_read will be done at this new position and will read the next byte(s) of data.
 *
 * Since the function only reads the contents starting from the buffer's current seek position, you must ensure this is set correctly before calling the function - otherwise, you will get either incorrect results or nothing at all being returned.
 *
 * @param {Buffer} buffer The buffer to read from.
 * @param {BufferType} type The type of data to be read from the buffer.
 * @returns {any}
 */
export function buffer_read(buffer, type) {
  try {
    const dv = buffer.dv;
    let pos = buffer.pos;
    const fmt = type.replace("buffer_", "");
    let result;

    switch (fmt) {
      case "u8":
        result = dv.getUint8(pos);
        pos += 1;
        break;
      case "s8":
        result = dv.getInt8(pos);
        pos += 1;
        break;
      case "u16":
        result = dv.getUint16(pos, true);
        pos += 2;
        break;
      case "s16":
        result = dv.getInt16(pos, true);
        pos += 2;
        break;
      case "u32":
        result = dv.getUint32(pos, true);
        pos += 4;
        break;
      case "s32":
        result = dv.getInt32(pos, true);
        pos += 4;
        break;
      case "u64": {
        const lo = dv.getUint32(pos, true);
        const hi = dv.getUint32(pos + 4, true);
        result = (BigInt(hi) << 32n) | BigInt(lo);
        pos += 8;
        break;
      }
      case "f32":
        result = dv.getFloat32(pos, true);
        pos += 4;
        break;
      case "f64":
        result = dv.getFloat64(pos, true);
        pos += 8;
        break;
      case "f16": {
        const f16 = dv.getUint16(pos, true);
        result = float16ToFloat32(f16);
        pos += 2;
        break;
      }
      case "bool":
        result = dv.getUint8(pos) !== 0;
        pos += 1;
        break;
      case "string": {
        const bytes = [];
        while (dv.getUint8(pos) !== 0) {
          bytes.push(dv.getUint8(pos++));
        }
        pos++; // skip null terminator
        result = decodeUTF8(new Uint8Array(bytes));
        break;
      }
      case "text": {
        const bytes = [];
        while (pos < dv.byteLength) {
          bytes.push(dv.getUint8(pos++));
        }
        result = decodeUTF8(new Uint8Array(bytes));
        break;
      }
      default:
        throw new Error(`buffer_read: unknown type '${type}'`);
    }
    buffer.pos = pos;
    return result;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/**
 * This function gets the size in bytes of the given buffer.
 *
 * @param {Buffer} buffer The buffer to get the size of.
 * @returns {Real}
 */
export function buffer_get_size(buffer) {
  return buffer.size;
}

/**
 * The buffer_peek() function reads a piece of data of a certain type from the given buffer at an arbitrary offset position (in bytes).
 *
 * Like the buffer_read() function, this function also reads data from a buffer. buffer_read(), however, always reads at the buffer's current "seek" position and advances this position by the number of bytes being read. This function allows you to read a given piece of data without changing the current seek position. You simply supply the function with a buffer, and then an offset position (from the buffer start) within that buffer to read from, as well as the data type that you want to read.
 *
 * @param {Buffer} buffer The buffer to use.
 * @param {Real} offset The offset position (in bytes) within the buffer to read the given data from.
 * @param {String} type The type of data that is to be read from the buffer.
 *
 * @returns {any}
 */
export function buffer_peek(buffer, offset, type) {
  try {
    const dv = buffer.dv;
    const fmt = type.replace("buffer_", "");
    let result;

    switch (fmt) {
      case "u8":
        result = dv.getUint8(offset);
        break;
      case "s8":
        result = dv.getInt8(offset);
        break;
      case "u16":
        result = dv.getUint16(offset, true);
        break;
      case "s16":
        result = dv.getInt16(offset, true);
        break;
      case "u32":
        result = dv.getUint32(offset, true);
        break;
      case "s32":
        result = dv.getInt32(offset, true);
        break;
      case "u64": {
        const lo = dv.getUint32(offset, true);
        const hi = dv.getUint32(offset + 4, true);
        result = (BigInt(hi) << 32n) | BigInt(lo);
        break;
      }
      case "f32":
        result = dv.getFloat32(offset, true);
        break;
      case "f64":
        result = dv.getFloat64(offset, true);
        break;
      case "f16": {
        const f16 = dv.getUint16(offset, true);
        result = float16ToFloat32(f16);
        break;
      }
      case "bool":
        result = dv.getUint8(offset) !== 0;
        break;
      default:
        throw new Error(`buffer_peek: unknown type '${type}'`);
    }
    return result;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/**
 * With this function you can write data into a buffer at the specified offset, without changing the seek position. This is different from buffer_write(), which uses the current seek position as the offset and advances that with the amount of bytes written.
 *
 * You supply the function with a buffer, and then the offset position from the buffer start (in bytes) within that buffer to write to, as well as the data type and the value to be written.
 *
 * @param {Buffer} buffer The buffer to use.
 * @param {Real} offset The offset position (in bytes) within the buffer to write the given data to.
 * @param {BufferType} type The type of data that is to be written to the buffer.
 * @param {any} value The data to write to the buffer at the given offseet, in accordance with the type specified.
 */
export function buffer_poke(buffer, offset, type, value) {
  try {
    const dv = buffer.dv;
    const fmt = type.replace("buffer_", "");

    switch (fmt) {
      case "u8":
        dv.setUint8(offset, value >>> 0);
        break;
      case "s8":
        dv.setInt8(offset, value | 0);
        break;
      case "u16":
        dv.setUint16(offset, value >>> 0, true);
        break;
      case "s16":
        dv.setInt16(offset, value | 0, true);
        break;
      case "u32":
        dv.setUint32(offset, value >>> 0, true);
        break;
      case "s32":
        dv.setInt32(offset, value | 0, true);
        break;
      case "u64": {
        const big = BigInt(value);
        const lo = Number(big & 0xffffffffn);
        const hi = Number((big >> 32n) & 0xffffffffn);
        dv.setUint32(offset, lo, true);
        dv.setUint32(offset + 4, hi, true);
        break;
      }
      case "f32":
        dv.setFloat32(offset, Number(value), true);
        break;
      case "f64":
        dv.setFloat64(offset, Number(value), true);
        break;
      case "f16": {
        const f16 = float32ToFloat16(Number(value));
        dv.setUint16(offset, f16, true);
        break;
      }
      case "bool":
        dv.setUint8(offset, value ? 1 : 0);
        break;
      default:
        throw new Error(`buffer_poke: unknown type '${type}'`);
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * This function writes information from a buffer to a given surface.
 *
 * Both the buffer and the surface must have been created previously, and the buffer's size must be equal to or greater than the surface's size. If the buffer is smaller than the surface, the function will silently fail.
 *
 * The surface you are writing to must have the same format as the surface that was written into the buffer. Keep in mind that it can't be guaranteed that a surface saved into a buffer on one platform will be read correctly on another platform, even if both surfaces use the same format.
 *
 * You can provide an offset into the buffer to start reading from. Reading will always start at the beginning of the buffer plus the offset value and not at the current seek position plus the offset value.
 *
 * @param {Buffer} buffer The buffer to use.
 * @param {SurfaceId} surfaceId The surface to use.
 * @param {Real} offset The data offset value.
 */
export function buffer_set_surface(buffer, surfaceId, offset) {
  try {
    if (typeof buffer !== "object" || !(buffer.dv instanceof DataView)) {
      throw new Error("Invalid buffer");
    }

    const surface = surfaces[surfaceId];
    if (!surface || !(surface.canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid surface ID: " + surfaceId);
    }

    const ctx = surface.context;
    const w = surface.canvas.width;
    const h = surface.canvas.height;

    const dv = buffer.dv;
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    let i = offset;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const index = (y * w + x) * 4;
        pixels[index] = dv.getUint8(i++); // R
        pixels[index + 1] = dv.getUint8(i++); // G
        pixels[index + 2] = dv.getUint8(i++); // B
        pixels[index + 3] = dv.getUint8(i++); // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.error("buffer_set_surface error:", e);
  }
}

/**
 * This function writes information from a surface to a given buffer.
 *
 * The buffer must have been created previously and should be a 1-byte aligned buffer large enough to store data for the surface you are going to write (if unsure, use a grow buffer or see the example at the bottom of this page).
 *
 * The information for the surface will always be written to the start of the buffer (regardless of the seek position) but you can choose an offset value (in bytes) to move the write position from the start of the buffer.
 *
 * The format of the surface will affect how the surface is written into the buffer, refer to the table on the linked page for information on how much space each pixel in a surface would take depending on the format. Keep in mind that the same format may be written in a different way on different platforms.
 *
 * Use buffer_set_surface() to write data from a buffer back into a surface.
 *
 * @param {Buffer} buffer The buffer to use.
 * @param {SurfaceId} surfaceId The surface id to use.
 * @param {Real} offset The data offset value (in bytes).
 */
export function buffer_get_surface(buffer, surfaceId, offset) {
  try {
    if (typeof buffer !== "object" || !(buffer.dv instanceof DataView)) {
      throw new Error("Invalid buffer");
    }

    const surface = surfaces[surfaceId];
    if (!surface || !(surface.canvas instanceof HTMLCanvasElement)) {
      throw new Error("Invalid surface ID: " + surfaceId);
    }

    const ctx = surface.context;
    const w = surface.canvas.width;
    const h = surface.canvas.height;

    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    if (buffer.size < w * h * 4) {
      throw new Error("Buffer too small for surface");
    }

    let i = offset;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const index = (y * w + x) * 4;
        buffer.dv.setUint8(i++, pixels[index]); // R
        buffer.dv.setUint8(i++, pixels[index + 1]); // G
        buffer.dv.setUint8(i++, pixels[index + 2]); // B
        buffer.dv.setUint8(i++, pixels[index + 3]); // A
      }
    }
  } catch (e) {
    console.error("buffer_get_surface error:", e);
  }
}

/**
 * This function will show a custom string as an error message.
 *
 * @param {String} str The string to show in the pop-up message.
 * @param {Boolean} abort Whether the error should abort the game (true) or allow the player to ignore it (false).
 */
export function show_error(str, abort) {
  alert(str);
  if (!abort) {
    try {
      throw new Error(str); // this will automatically abort because its uncaught
    } catch (e) {
      console.error(e);
    }
  } else {
    throw new Error(str);
  }
}

/**
 * This function creates a pop-up message box which displays the given string and a button marked "Ok" to close it.
 *
 * @param {String} str The string to show in the pop-up message.
 */
export function show_message(str) {
  alert(str);
}

/**
 * This function creates a pop-up message box with two buttons for "Ok" and "Cancel". It returns true or false depending on which one of the two buttons the user presses.
 *
 * @param {String} str The string to show in the pop-up question.
 *
 * @returns {Boolean}
 */
export function show_question(str) {
  return confirm(str);
}

/**
 * This function will return true if the platform compiles outside of the virtual machine, such as for the YYC and JS platforms.
 *
 * @returns {Boolean}
 */
export function code_is_compiled() {
  return true; // this will always be true for js since HTML5 target is compiled outside of the vm.
}

/**
 * This function generates an array of strings as the "callstack" where the current script is listed first, and then all the other scripts that were run in order for the current script to be executed. The exact string format will vary depending on the target platform chosen, but it will mostly have the script/event name, then a colon : and the line number.
 *
 * The function allows for an optional argument to be passed in, which is the maximum depth of the returned callstack. This value is the number of scripts that are included in the returned array starting from the current script. If this argument is not specified, then the full callstack will be returned.
 *
 * This function is not very useful, since it doesnt return a javascript callstack, but an emulated gamemaker one (for parity).
 *
 * @param {Real} [maxdepth] The maximum depth of the callstack that is returned
 */
export function debug_get_callstack(maxdepth = 10) {
  // why the fuck is this guy so complicated compared to the rest wtf :sob:
  // Create an error to get the stack trace
  const err = new Error();
  const stack = err.stack || "";

  // Split stack into lines (skip first line: it's the error message)
  const lines = stack.split("\n").slice(1);

  const callstack = [];

  for (let i = 0; i < lines.length && callstack.length < maxdepth; i++) {
    const line = lines[i].trim();

    // Typical line formats:
    // Chrome: "at functionName (fileURL:line:col)"
    // Firefox: "functionName@fileURL:line:col"

    let match = null;

    // Chrome-like
    match = line.match(/^at (\S+) \((.*):(\d+):(\d+)\)$/);
    if (!match) {
      // Firefox-like
      match = line.match(/^(\S+)@(.+):(\d+):(\d+)$/);
    }

    if (match) {
      const funcName = match[1];
      const lineNum = match[3];
      callstack.push(`${funcName}:${lineNum}`);
    } else {
      // fallback if no match (anonymous or native)
      callstack.push(line);
    }
  }

  return callstack;
}
