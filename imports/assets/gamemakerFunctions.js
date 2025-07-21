import { _key_prev_state, _key_state } from '/imports/input.js';
import { playingSounds, c_white, c_yellow, rooms } from '/imports/assets.js'
import { ctx, ogCanvas } from '/imports/canvasSetup.js';
import global from '/imports/assets/global.js';

let ini_filename = null;
let ini_data = {};
let ini_loaded = false;
const __ds_map_store = {};
let __ds_map_next_id = 0;

const spriteOffsets = {
  "spr_tobdog_summer": {
    xoffset: 15,
    yoffset: 22,
  },
  "spr_tobdog_sleep_trash": {
    xoffset: 13,
    yoffset: 6,
  },
  "spr_blconwdshrt": {
    xoffset: 2,
    yoffset: 2,
  },
}

const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");
offCtx.imageSmoothingEnabled = false;

let currentDrawColor = c_white;
let currentFont = null;
let secondFont = null;
let thirdFont = null;
const instances = new Map();

const spriteCache = {};
const maskCache = {};
const globalTintCache = new Map();

function getBoundingBox() {
  const scaleX = this.image_xscale ?? 1;
  const scaleY = this.image_yscale ?? 1;

  const sprite = this.sprite_index;
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
      const fallbackWidth = 32 * scaleX;
      const fallbackHeight = 32 * scaleY;
      this.bbox_left = this.x;
      this.bbox_top = this.y;
      this.bbox_right = this.x + fallbackWidth;
      this.bbox_bottom = this.y + fallbackHeight;
      return;
    }
  }

  const data = mask.imageData.data;
  const width = mask.imageData.width;
  const height = mask.imageData.height;

  // Find the bounding box of white (collision) pixels
  let left = width, top = height, right = 0, bottom = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
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
    this.bbox_left = this.x;
    this.bbox_top = this.y;
    this.bbox_right = this.x;
    this.bbox_bottom = this.y;
    return;
  }

  // Apply position and scale
  const bboxX1 = this.x + left * scaleX;
  const bboxX2 = this.x + (right + 1) * scaleX;
  const bboxY1 = this.y + top * scaleY;
  const bboxY2 = this.y + (bottom + 1) * scaleY;

  this.bbox_left = Math.min(bboxX1, bboxX2);
  this.bbox_right = Math.max(bboxX1, bboxX2);
  this.bbox_top = Math.min(bboxY1, bboxY2);
  this.bbox_bottom = Math.max(bboxY1, bboxY2);
}

// image cache loader
function loadImageCached(path, cache) {
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
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    cache[path].imageData = ctx.getImageData(0, 0, img.width, img.height);
  };

  return cache[path];
}

/**
 * With this function you can play any sound asset in your game. You provide the sound asset and assign it a priority, which is then used to determine how sounds are dealt with when the number of sounds playing is over the limit set by the function audio_channel_num(). Lower priority sounds will be stopped in favour of higher priority sounds, and the priority value can be any real number (the actual value is arbitrary, and can be from 0 to 1 or 0 to 100, as GameMaker will prioritize them the same). The higher the number the higher the priority, so a sound with priority 100 will be favoured over a sound with priority 1. The third argument is for making the sound loop and setting it to true will make the sound repeat until it's stopped manually, and setting it to false will play the sound once only.
 * 
 * @param {string} index The index of the sound to play.
 * @param {number} priority Set the channel priority for the sound.
 * @param {boolean} loop Sets the sound to loop or not.
 * @param {number} gain [OPTIONAL] Value for the gain.
 * @param {number} offset [OPTIONAL] The time (in seconds) to set the start point to. Values longer than the length of the given sound are ignored.
 * @param {number} pitch [OPTIONAL] The pitch multiplier (default 1).
 * 
 * @returns {string}
 */
function audio_play_sound(index, priority, loop, gain = 1, offset = 0, pitch = 1) {
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
 * @param {string} index The index of the sound to change.
 * @param {number} pitch The pitch multiplier (default 1).
 */
function audio_sound_pitch(index, pitch, id = null) {
  index.rate(pitch, id ?? index._sounds[0]?._id);
}

/**
 * With this function you can fade a sound in or out over a given length of time, or it can be used to set the sound gain instantly. The time is measured in milliseconds, and the function requires that you input a final level of gain for the sound to have reached by the end of that time. This gain can be between 0 (silent) and any value greater than 0, although normally you'd consider the maximum volume as 1. Anything over 1 can be used but, depending on the sound used and the platform being compiled to, you may get distortion or clipping when the sound is played back. Note that the gain scale is linear, and to instantly change the gain, simply set the time argument to 0. This function will affect all instances of the sound that are playing currently in the room if the index is a sound resource, and the final volume will be the volume at which all further instances of the sound will be played. However if you have used the index returned from a function like audio_play_sound() it will only affect that one instance of the sound.
 * 
 * @param {string} index The index of the sound to set the gain for.
 * @param {number} volume Value for the music volume.
 * @param {number} time The length for the change in gain in milliseconds.
 */
function audio_sound_gain(index, volume, time = 0, id = null) {
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
 * @param {object} index The index of the sound to check.
 * 
 * @returns {boolean}
 */
function audio_is_playing(index, id = null) {
  id = id ?? index._sounds[0]?._id;
  return id !== null ? index.playing(id) : false;
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
 * This function will stop the given sound if it is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be stopped.
 * 
 * @param {string} index The index of the sound to stop.
 */

function audio_stop_sound(index, id = null) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) index.stop(id);
}

/** 
 * This function will get the font currently assigned for drawing text. The function will return -1 if no font is set, or the name of the font assigned.
 * 
 * @returns {string | -1} The font name, or -1 if none.
 */
function draw_get_font() {
  if (currentFont === null) return -1;
  return currentFont;
}

/**
 * With this function you can set the base draw colour for the game. This will affect drawing of fonts, forms, primitives and 3D, however it will not affect sprites (drawn manually or by an instance). If any affected graphics are drawn with their own colour values, this value will be ignored.
 * 
 * @param {string} colour - The colour to set for drawing.
 * @returns {void}
 */
function draw_set_color(col) {
  currentDrawColor = col.toLowerCase();
}

/**
 * With this function you can draw any string at any position within the room. To combine strings you can use + and you can also use \n within a string to add a line break so it is drawn over multiple lines.
 * 
 * @param {number} x The x coordinate of the drawn string.
 * @param {number} y The y coordinate of the drawn string.
 * @param {string} string The string to draw.
 * @returns {void}
 */
function draw_text(x, y, string, second) {
  draw_text_transformed(x, y, string, 1, 1, 0, second);
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
function draw_text_transformed(x, y, string, xscale = 1, yscale = 1, angle = 0, second = 0) {
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
      throw new Error(`draw_text_transformed(${x}, ${y}, "${string}", ${xscale}, ${yscale}, ${angle}): font not set. Please run draw_set_font(font_object);.`)
    }

    if (!font.image || font.loading) {
      console.warn("Font not loaded. Drawing skipped for this frame.");
      return;
    }

    const lines = String(string).split(/\n|#/); // Handle line breaks
    const lineHeight = font.glyphs[" "]?.h || font.size;

    // Approximate total text block size
    const textWidths = lines.map(line => {
      return Array.from(line).reduce((w, char) => {
        const glyph = font.glyphs[char];
        return w + ((glyph?.shift ?? (glyph?.w + (glyph?.offset || 0))) * xscale);
      }, 0);
    });

    // Save context and apply global transform
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-((angle * Math.PI) / 180));
    ctx.scale(xscale, yscale);

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
        const offsetY = glyph.yoffset || 0;

        ctx.save();
        ctx.translate(xOffset + offsetX, yOffset - offsetY);

        if (currentDrawColor !== c_white) {
          const tintedGlyphCanvas = get_tinted_glyph(glyph, currentDrawColor, char, second);
          ctx.drawImage(tintedGlyphCanvas, 0, 0);
        } else {
          ctx.drawImage(
            font.image,
            glyph.x, glyph.y, glyph.w, glyph.h,
            0, 0, glyph.w, glyph.h
          );
        }

        ctx.restore();

        xOffset += (glyph.shift ?? (glyph.w + (glyph.offset || 0)));
      }

      yOffset += lineHeight;
    }

    ctx.restore();
  } catch(error) {
    console.error(error);
  }
}

// draw_text_transformed helper
function get_tinted_glyph(glyph, tintColor, char, second) {
  tintColor = tintColor.toLowerCase(); // normalize color case

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

  const canvas = document.createElement("canvas");
  canvas.width = glyph.w;
  canvas.height = glyph.h;
  const gctx = canvas.getContext("2d");

  gctx.drawImage(
    font.image,
    glyph.x, glyph.y, glyph.w, glyph.h,
    0, 0, glyph.w, glyph.h
  );

  gctx.globalCompositeOperation = "source-in";
  gctx.fillStyle = tintColor;
  gctx.fillRect(0, 0, glyph.w, glyph.h);
  gctx.globalCompositeOperation = "source-over";

  globalTintCache.set(cacheKey, canvas);
  return canvas;
}

/** 
 * With this function you can check to see if a key has been pressed or not. Unlike the keyboard_check() function, this function will only run once for every time the key is pressed down, so for it to trigger again, the key must be first released and then pressed again. The function will take a keycode value as returned by any of the vk_* constants listed far above.
 * 
 * @param {string} key The key to check the pressed state of.
 * 
 * @returns {boolean}
 */
function keyboard_check_pressed(key) {
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
      key = {
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
        "`": "Backquote"
      }[key] || key; // fallback to raw key if unknown
    }
  }

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
function draw_set_font(font, second) {
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
      if (global.debug === 1 && img) {
        document.body.appendChild(img);
      }
    };
  }
}


/**
 * This function permits you to go to any room in your game project. You supply the room index (stored in the variable for the room name). Note that the room will not change until the end of the event where the function was called, so any code after this has been called will still run if in the same event. This function will also trigger the Room End event.  WARNING: This function takes the room name as a string (so instead of room_menu itd be "room_menu" with the quotes).
 * 
 * @param {string} index 
 */
function room_goto(index) {
  global.eventDone = false;
  global.roomEnd = true;
  global.nextRoom = `/room/${index.slice(5)}/`;
}

/**
 * This is the instance_create() description.
 * TODO: document
 * 
 * @param {number} x The x position the object will be created at
 * @param {number} y The y position the object will be created at
 * @param {string} obj The object index of the object to create an instance of
 */
function instance_create(x, y, obj) {
  try {
    if (obj === null || typeof obj !== "object" || !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error("instance_create: called with invalid parameters:", { x, y, obj })
    }
    const instance = {
      ...obj.create?.(), // get default vars (including x/y defaulting to 0)
      _object: obj,
    };

    instance.x = x;
    instance.y = y;
    instance.startx = x;
    instance.starty = y;
    instance.xstart = x;
    instance.ystart = y;

    if (!instances.has(obj)) {
      instances.set(obj, []);
    }
    instances.get(obj).push(instance);

    obj.roomStart?.call(instance);

    return instance;
  } catch(error) {
    console.error(error);
  }
}

/**
 * You call this function whenever you wish to "destroy" an instance, normally triggering a Destroy Event and also a Clean Up Event. This will remove it from the room until the room is restarted (unless the room is persistent). Calling the function will simply destroy all instances of a particular object.
 * 
 * @param {string} index The object asset to destroy instances of
 * @returns {void}
 */
function instance_destroy(target) {
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
  if (target && typeof target === "object" && "_object" in target) {
    target.destroy?.call(target);
    target.cleanUp?.call(target);
    const list = instances.get(target._object);
    if (list) {
      const i = list.indexOf(target);
      if (i !== -1) list.splice(i, 1);
    }
    return;
  }

  // Otherwise, assume it's an object module: destroy all matching instances (including children)
  for (const list of instances.values()) {
    // Make a copy so we can safely remove while iterating
    const toDestroy = list.filter(inst => isInstanceOf(inst, target));
    for (const inst of toDestroy) {
      inst.destroy?.call(inst);
      inst.cleanUp?.call(inst);
      const i = list.indexOf(inst);
      if (i !== -1) list.splice(i, 1);
    }
  }
}


/**
 * This function can be used in two ways depending on what you wish to check. You can give it an object_index to check for, in which case this function will return true if any active instances of the specified object exist in the current room, or you can also supply it with an instance id, in which case this function will return true if that specific instance exists and is active in the current room.
 * 
 * @param {object} obj The object or instance to check for the exsistence  of
 * @returns {boolean}
 */
function instance_exists(obj) {
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
 * @param {object} obj 
 * @returns {number}
 */
function instance_number(obj) {
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
 * @param {object} sprite The index of the sprite to draw
 * @param {number} subimg The sub-image (frame) of  the  sprite to draw (image_index or -1 correlate to the current frame of animation in the object)
 * @param {number} x The x coordinate of where to draw the spirte
 * @param {number} y The y coordinate of where to draw the sprite
 */
function draw_sprite(sprite, subimg, x, y) {
  draw_sprite_ext(sprite, subimg, x, y, 1, 1, 0, c_white, 1)
}

/**
 * This function will draw the given sprite as in the function draw_sprite() but with additional options to change the scale, blending, rotation and alpha of the sprite being drawn. Changing these values does not modify the resource in any way (only how it is drawn), and you can use any of the available sprite variables instead of direct values for all the arguments in the function.
 * 
 * @param {object} sprite The index of the sprite to draw
 * @param {number} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in thhe object)
 * @param {number} x The x coordinate of where to draw the sprite
 * @param {number} y The y coordinate of where to draw the sprite
 * @param {number} xscale The horizontal scaling of the sprite, as a multiplier: 1 = normall scaling, 0.5 is half etc...
 * @param {number} yscale The vertical scaling of the sprite as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {number} rot The rotation of the sprite. 0=right way up, 90=rotated 90 degrees counter-clockwise etc...
 * @param {string} colour The colour with which to blend the sprite. c_white is to display it normally
 * @param {number} alpha The alpha of the sprite (from 0 to 1 where 0 is transparent and 1 opaque).
 * @returns {void}
 */
function draw_sprite_ext(sprite, subimg, x, y, xscale, yscale, rot, colour, alpha, returnImg = 0) {
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

  ctx.save();
  
  ctx.translate(x - ox * xscale, y - oy * yscale);
  ctx.rotate(rot * Math.PI / 180);
  ctx.scale(xscale, yscale);
  ctx.globalAlpha = alpha;

  if (colour && colour.toLowerCase() !== c_white) {
    // Tinting logic using offscreen canvas
    const tintCanvas = document.createElement("canvas");
    tintCanvas.width = img.width;
    tintCanvas.height = img.height;

    const tintCtx = tintCanvas.getContext("2d");

    // Draw the sprite image first
    tintCtx.drawImage(img, 0, 0);

    // Apply the color overlay with source-in
    tintCtx.globalCompositeOperation = "source-in";
    tintCtx.fillStyle = colour;
    tintCtx.fillRect(0, 0, img.width, img.height);

    // Draw the tinted canvas onto main canvas
    ctx.drawImage(tintCanvas, 0, 0);
  } else {
    // No tint, just draw normal
    ctx.drawImage(img, 0, 0);
  }

  ctx.restore();

  if (returnImg === 1 && img) {
    return img;
  }
}

/**
 * With this function you can draw part of any sprite at a given position within the room. As with draw_sprite() you can specify a sprite and a sub-image for drawing, then you must give the relative coordinates within the sprite of the area to select for drawing. This means that a left position of 0 and a top position of 0 would be the top left corner of the sprite and all further coordinates should be taken from that position.
 * 
 * @param {object} sprite The index of the sprite to draw.
 * @param {number} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in the object).
 * @param {number} left The x position on the sprite of the top left corner of the area to draw.
 * @param {number} top The y position on the sprite of the top left corner of the area to draw.
 * @param {number} width The width of the area to draw.
 * @param {number} height The height of the area to draw.
 * @param {number} x The x coordinate of where to draw the sprite.
 * @param {number} y The y coordinate of where to draw the sprite.
 */
function draw_sprite_part(sprite, subimg, left, top, width, height, x, y) {
  draw_sprite_part_ext(sprite, subimg, left, top, width, height, round(x), round(y), 1, 1, c_white, 1);
}

/**
 * This function will draw a part of the chosen sprite at the given position following the same rules as per draw_sprite_part(), only now you can scale the part, blend a colour with it, or change its alpha when drawing it to the screen (the same as when drawing a sprite with draw_sprite_ext()).
 * 
 * @param {object} sprite The index of the sprite to draw.
 * @param {number} subimg The subimg (frame) of the sprite to draw (image_index or -1 correlate to the current frame of animation in the object).
 * @param {number} left The x position on the sprite of the top left corner of the area to draw.
 * @param {number} top The y position on the sprite of the top left corner of the area to draw.
 * @param {number} width The width of the area to draw.
 * @param {number} height The height of the area to draw.
 * @param {number} x The x coordinate of where to draw the sprite.
 * @param {number} y The y coordinate of where to draw the sprite.
 * @param {number} xscale The horizontal scaling of the sprite, as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {number} yscale The vertical scaling of the sprite, as a multiplier: 1 = normal scaling, 0.5 is half etc...
 * @param {string} colour The colour with which to blend the sprite. c_white is to display it normally.
 * @param {number} alpha The alpha of the sprite (from 0 to 1 where 0 is transparent and 1 opaque).
 */
function draw_sprite_part_ext(sprite, subimg, left, top, width, height, x, y, xscale = 1, yscale = 1, colour = c_white, alpha = 1) {
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
  const ox = img.width / 2;
  const oy = img.height / 2;

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(xscale, yscale);
  ctx.globalAlpha = alpha;

  if (colour.toLowerCase() !== c_white) {
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offctx = offscreen.getContext("2d");

    offctx.drawImage(img, left, top, width, height, 0, 0, width, height);

    offctx.globalCompositeOperation = "source-in";
    offctx.fillStyle = colour;
    offctx.fillRect(0, 0, width, height);

    ctx.drawImage(offscreen, -ox, -oy);
  } else {
    ctx.drawImage(img, left, top, width, height, -ox, -oy, width, height);
  }

  ctx.restore();
}

/**
 * You can use this function to return a specific character at a specific position within a string, with the index starting at 1 for the first character. If no character is found or the string is shorter than the given index value, an empty string "" is returned, however if the given index is equal to or smaller than 0, then the first character of the string is returned.
 * 
 * @param {string} str The string to check.
 * @param {number} index The position to get the character from.
 * @returns {string}
 */
function string_char_at(str, index) {
  return str.charAt(index) ?? "";
}

/**
 * This function takes any real number and rounds it up to the nearest integer. Care should be taken with this function as one common mistake is to use it round up a random value and expect it always to be greater than 1, ie: "let int = ceil(random(5));" Now, you would expect this code to always give an integer between 1 and 5, but this may not always be the case as there is a very small possibility that the random function will return 0, and rounding up 0 still gives you 0. This is a remote possibility but should be taken into account when using this function.
 * 
 * @param {number} x The number to change.
 * @returns {number}
 */
function ceil(x) {
  return Math.ceil(x);
}

/**
 * Returns the floor of n, that is, n rounded down to an integer. This is similar to the round() function, but it only rounds down, no matter what the decimal value, so floor(5.99999) will return 5, as will floor(5.2), floor(5.6457) etc...
 * 
 * @param {number} n The number to floor.
 * @returns {number}
 */
function floor(n) {
  return Math.floor(n);
}

/**
 * Just as it says, round() takes a number and rounds it up or down to the nearest integer. In the special case where the number supplied is exactly a half-integer (1.5, 17.5, -2.5, etc), the number will be rounded to the nearest even value, for example, 2.5 would be rounded to 2, while 3.5 will be rounded to 4. This type of rounding is called bankers rounding and over large numbers of iterations or when using floating point maths, it gives a statistically better rounding than the more traditional "round up if over .5 and round down otherwise" approach. What this means is that if the fraction of a value is 0.5, then the rounded result is the even integer nearest to the input value. So, for example, 23.5 becomes 24, as does 24.5, while -23.5 becomes -24, as does -24.5. This method treats positive and negative values symmetrically, so is therefore free of sign bias, and, more importantly, for reasonable distributions of values, the expected (average) value of the rounded numbers is the same as that of the original numbers.
 * 
 * @param {number} n The number to round
 * @returns {number}
 */
function round(n) {
  let floorNumber = Math.floor(n);
  let roundNumber = Math.round(n);

  // if the floor of the number is divisible by two and rounding the number is not divisible by two and (removing or adding 0.5 from the number) is equal to the floor of the number then return the floor of the number, else return the number rounded
  if (floorNumber % 2 === 0 && roundNumber % 2 !== 0 && (n - 0.5 === floorNumber || n + 0.5 === floorNumber)) {
    return floorNumber;
  } else {
    return roundNumber;
  }
}

/**
 * This function returns a random floating-point (decimal) number between 0.0 (inclusive) and the specified upper limit (inclusive). For example, random(100) will return a value from 0 to 100.00, but that value can be 22.56473! You can also use real numbers and not integers in this function like this - random(0.5), which will return a value between 0 and 0.500.
 * 
 * @param {number} n The upper range from which the random number will be selected
 * @returns {number}
 */
function random(n) {
  return Math.random() * n;
}

/**
 * This function simply returns the width, in pixels, of the indexed surface. It should be noted that if you call this to check the application_surface immediately after having changed its size using surface_resize() it will not return the new value as the change needs a step or two to be fully processed. After waiting a step it should return the new size correctly.
 * 
 * @param {string} surface 
 * @returns {number}
 */
function surface_get_width(surface) {
  console.warn(`STUB: surface_get_width(${surface}). returning gameCanvas.width instead`);
  return ogCanvas.width;
}

/**
 * This function calls a Script Function or Method with the given arguments.
 * 
 * @param {function} scr  	The function/script or method that you want to call.
 * @param  {...any} args OPTIONAL The different arguments that you want to pass through to the function/script
 * @returns {any}
 */
function script_execute(scr, ...args) {
  return scr.call(this, ...args);
}

/**
 * This function can be used to turn a value into a number. When using this function on a string, numbers, minus signs, decimal points and exponential parts in the string are taken into account, while other characters (such as letters) will cause an error to be thrown.
 * 
 * @param {string} n The string to be converted to a number.
 * @returns {number}
 */
function real(n) {
  return parseInt(n);
}

/**
 * This function draws either an outline of a rectangle or a filled rectangle where the (x1,y1) position is the top left corner and the (x2,y2) position is the bottom right corner.
 * 
 * @param {number} x1 The x coordinate of the top left corner of the rectangle
 * @param {number} y1 The y coordinate of the top left corner of the rectangle
 * @param {number} x2 The x coordinate of the bottom right corner of the rectangle
 * @param {number} y2 The y coordinate of the bottom right corner of the rectangle
 * @param {boolean} outline Whether the rectangle is drawn filled (false) or as a one pixel wide outline (true)
 */
function draw_rectangle(x1, y1, x2, y2, outline) {
  ctx.fillStyle = currentDrawColor;
  ctx.strokeStyle = currentDrawColor
  x1 = round(x1);
  x2 = round(x2);
  y1 = round(y1);
  y2 = round(y2);
  ctx.beginPath();
  ctx.rect(x1, y1, x2 - x1, y2 - y1);
  if (outline) {
    ctx.stroke()
  } else {
    ctx.fill()
  }
}

/**
 * This function takes a single character input string and returns the Unicode (UTF16) value for that character. Note that when used with the keyboard_check* functions, the input string can only be one character in length and can only be a number from 0 to 9 or a capitalised Roman character from A to Z.
 * 
 * @param {string} string The string with which to find the Unicode value
 * @returns {number}
 */
function ord(string) {
  return string.codePointAt(0);
}

/**
 * This is the draw_background() help.
 * 
 * @param {string} background The background to draw.
 * @param {number} x The x position to draw the background at.
 * @param {number} y The y position to draw the background at.
 * @returns {void}
 */
function draw_background(background, x, y) {
  if (!background) return;

  const img = new Image();
  img.src = `/bg/${background}.png`;

  img.onload = () => {
    ctx.drawImage(img, round(x), round(y))
  }
}

/**
 * This function is used to remove a part of the given string. You supply the input string, the starting position within that string to remove characters from (the index starts at 1) and the number of characters to remove. The function will return a new string without that part in it.
 * 
 * @param {string} str The string to copy and delete from.
 * @param {number} index The position of the first character to remove (from 1).
 * @param {number} count The number of characters to remove.
 * @returns {string}
 */
function string_delete(str, index, count) {
    if (index < 1 || count < 1) return str; // GameMaker-style: index starts at 1

    // Convert from 1-based to 0-based index
    let start = index - 1;

    return str.slice(0, start) + str.slice(start + count);
}

/**
 * With this function you can take two colours and then merge them together to make a new colour. The amount of each of the component colours can be defined by changing the "amount" argument, where a value of 0 will return the first colour (col1), a value of 1 will return the second colour (col2) and a value in between will return the corresponding mix. For example, a value of 0.5 will mix the two colours equally. The following image illustrates how this works by merging the colours red and blue together:
 * 
 * @param {string} col1 The first colour to merge
 * @param {string} col2 The second colour to merge
 * @param {number} amount How much of each colour should be merged. For example, 0 will return col1, 1 will return col2, and 0.5 would return a merge of both colours equally
 * @returns {string}
 */
function merge_color(col1, col2, amount) {
  // Parse hex colors like "#RRGGBB"
  const c1 = hexToRgb(col1);
  const c2 = hexToRgb(col2);

  const r = Math.round(c1.r + (c2.r - c1.r) * amount);
  const g = Math.round(c1.g + (c2.g - c1.g) * amount);
  const b = Math.round(c1.b + (c2.b - c1.b) * amount);

  return rgbToHex(r, g, b);
}
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

function room_next(room) {
  if (typeof room !== "string") return;

  let roomIndex = rooms.indexOf(room)

  if (roomIndex === -1) return -1;

  return rooms[roomIndex + 1];
}

function room_previous(room) {
  if (typeof room !== "string") return;

  let roomIndex = rooms.indexOf(room)

  if (roomIndex === -1) return -1;

  return rooms[roomIndex - 1];
}

function room_goto_next() {
  room_goto(room_next(global.currentRoom));
}

function room_goto_previous() {
  room_goto(room_previous(global.currentRoom));
}

function collision_rectangle(x1, y1, x2, y2, obj, prec = false, notme = false) {
  if (
    (
      typeof this.bbox_left !== "number" ||
      typeof this.bbox_right !== "number" ||
      typeof this.bbox_top !== "number" ||
      typeof this.bbox_bottom !== "number"
    )
  ) {
    console.warn(`${this.name}'s bounding boxes not set.`);
    return null;
  }
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

      if (obj !== "all" && !isInstanceOf(inst, obj)) continue;

      let bw = 0;
      let bh = 0;

      const spritePath = `/spr/${inst.sprite_index}/${inst.sprite_index}_${floor(inst.image_index) || 0}.png`;
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
        const hit =
          x1 < right &&
          x2 > left &&
          y1 < bottom &&
          y2 > top;

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
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
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

function collision_point(x, y, obj, notme = false) {
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
      if (obj !== "all" && !isInstanceOf(inst, obj)) continue;

      const sprite = inst.sprite_index;
      const frame = floor(inst.image_index) || 0;
      const spritePath = `/spr/${sprite}/${sprite}_${frame}.png`;
      const spriteCacheEntry = loadImageCached(spritePath, spriteCache);

      const scaleX = inst.image_xscale ?? 1;
      const scaleY = inst.image_yscale ?? 1;

      let bw = 32, bh = 32;
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
          localX < 0 || localY < 0 ||
          localX >= mask.imageData.width ||
          localY >= mask.imageData.height
        ) continue;

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

function collision_line(x1, y1, x2, y2, obj, prec = false, notme = false) {
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

function ini_open(filename) {
  ini_filename = filename;
  const raw = localStorage.getItem(filename);
  ini_data = raw ? JSON.parse(raw) : {};
  ini_loaded = true;
}

function ini_close() {
  if (!ini_filename || !ini_loaded) return;
  localStorage.setItem(ini_filename, JSON.stringify(ini_data));
}

function ini_read_string(section, key, defaultValue = "") {
  return ini_data?.[section]?.[key] ?? defaultValue;
}

function ini_read_real(section, key, defaultValue = 0) {
  return parseFloat(ini_read_string(section, key, defaultValue)) || 0;
}

function ini_write_string(section, key, value) {
  if (!ini_data[section]) ini_data[section] = {};
  ini_data[section][key] = String(value);
}

function ini_write_real(section, key, value) {
  ini_write_string(section, key, value);
}

function ini_section_exists(section) {
  return ini_data.hasOwnProperty(section);
}

function ini_key_exists(section, key) {
  return ini_data?.[section]?.hasOwnProperty(key) ?? false;
}

function ini_key_delete(section, key) {
  if (ini_data?.[section]) {
    delete ini_data[section][key];
  }
}

function ini_section_delete(section) {
  delete ini_data[section];
}

function ini_export() {
  if (!ini_filename || !ini_loaded) return;

  let iniText = "";
  for (const section in ini_data) {
    iniText += `[${section}]\r\n`; // newline after section header

    const entries = ini_data[section];
    const keys = Object.keys(entries);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      iniText += `${key}=${entries[key]}\r\n`;
    }

    iniText += `\r\n`; // extra newline after last key in section
  }

  const blob = new Blob([iniText], { type: "text/plain" });
  console.log(iniText);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${ini_filename}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function ini_import(iniText, filename) {
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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      ini_data[currentSection][key] = value;
    }
  }

  // Save to localStorage
  localStorage.setItem(String(filename), JSON.stringify(ini_data));
}



function file_exists(filename) {
  return localStorage.getItem(filename) !== null;
}

function choose(...args) {
  if (args.length === 0) return undefined;
  const index = Math.floor(Math.random() * args.length);
  return args[index];
}

/**
 * With this function you can draw either an outline of a circle or a filled circle.
 * 
 * @param {number} x The x coordinate of the center of the circle.
 * @param {number} y The y coordinate of the center of the circle.
 * @param {number} r The circle's radius (length from its center to its edge)
 * @param {boolean} outline Whether the circle is drawn filled (false) or as a one pixel wide outline (true).
 */
function draw_circle(x, y, r, outline) {
  ctx.fillStyle = currentDrawColor;
  ctx.strokeStyle = currentDrawColor
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
  if (outline) {
    ctx.stroke()
  } else {
    ctx.fill()
  }
}

// Creates a new map and returns its ID
function ds_map_create() {
  const id = __ds_map_next_id++;
  __ds_map_store[id] = {};
  return id;
}

// Adds a key-value pair to a map
function ds_map_add(map_id, key, value) {
  if (__ds_map_store[map_id]) {
    __ds_map_store[map_id][key] = value;
  }
}

// Retrieves a value from a map by key
function ds_map_find_value(map_id, key) {
  const map = __ds_map_store[map_id];
  if (map && key in map) return map[key];
  return undefined;
}

function string_copy(str, index, count = 1) {
  return str.substring(index - 1, index - 1 + count);
}

function string_length(str) {
  return str.length;
}

function string(str) {
  return String(str);
}

function room_get_name(index) {
  return rooms[index] ?? "";
}

function point_distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function distance_to_point(x, y) {
  return point_distance(this.x, this.y, x, y)
}

/**
 * Moves the instance towards a given point at a given speed.
 * 
 * @param {number} x The x position of the point to move towards.
 * @param {number} y The y position of the point to move towards.
 * @param {number} sp The speed to move at in pixels per second.
 * @returns {void}
 */
function move_towards_point(x, y, sp) {
  const dx = x - this.x;
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

  // Optional: update position immediately if you want
  // this.x += this.hspeed;
  // this.y += this.vspeed;
}

function _with(obj, fn) {
  try {
    if (fn.prototype === undefined) {
      throw new Error("_with: callback must not be an arrow function");
    }

    if (typeof obj !== "object") {
      throw new Error("_with: object must be an object");
    } 

    if (obj._object) {
      obj = obj._object;
    }

    const instancesOfObj = instances.get(obj) || [];
    for (const inst of instancesOfObj) {
      fn.call(inst);
    }
  } catch(error) {
    console.error(`with() error on object ${obj?.name || '[unknown]'}`, error);
  }
}

function abs(val) {
  return Math.abs(val)
}

function action_move(direction, speed) {
  const directions = [
    225,
    270,
    315,
    180,
    null,
    0,
    135,
    90,
    45,
  ];

  const index = direction.indexOf("1");

  if (index === -1 || directions[index] === null || speed === 0) {
    this.speed = 0;
    this.hspeed = 0;
    this.vspeed = 0;
    this.direction = 0;
    return;
  } else {
    this.direction = directions[index];
    this.speed = speed
    const rad = (this.direction * Math.PI) / 180;
    this.hspeed = Math.cos(rad) * speed;
    this.vspeed = -Math.sin(rad) * speed;
  }
}

/**
 * With this function you can resume any sound that is currently paused (after using the function audio_pause_sound()). The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be re-started.
 * 
 * @param {object} index The index of the sound to resume.
 * @returns {void}
 */
function audio_resume_sound(index, id = null) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) index.play(id);
}

/**
 * With this function you can pause any sound that is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be paused.
 * 
 * @param {object} index The index of the sound to pause.
 * @returns {void}
 */
function audio_pause_sound(index, id = null) {
  id = id ?? index._sounds[0]?._id;
  if (id !== null) index.pause(id);
}

/**
 * All instances have a unique identifier (id) which can be used to modify and manipulate them while a game is running, but you may not always know what the id for a specific instance is and so this function can help as you can use it to iterate through all of them to find what you need. You specify the object that you want to find the instance of and a number, and if there is an instance at that position in the instance list then the function returns the id of that instance, and if not it returns the special keyword noone. You can also use the keyword all to iterate through all the instances in a room, as well as a parent object to iterate through all the instances that are part of that parent / child hierarchy, and you can even specify an instance (if you have its id) as a check to see if it actually exists in the current room. Please note that as instances are sorted in an arbitrary manner, there is no specific order to how the instances are checked by this function, and any instance can be in any position.
 * 
 * @param {object} obj The object to find the nth instance of
 * @param {number} n The number of the instance to find
 * @returns {object} The instance (or null if none)
 */
function instance_find(obj, n) {
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
      throw new Error(`instance_find: index ${n} out of range for object`, obj.name || obj);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * You can use this function to change one instance of an object into another instance of a different object, and while doing so decide whether to perform the initial instances Destroy and Clean Up Events and the new instances Create Event. In this way, you can have (for example) a bomb change into an explosion - in which case the "perf" argument would probably be true as you would want the bomb to perform its Destroy Event and Clean Up Event, as well as the explosion to perform its Create Event - or you could have your player character change into a different one - in which case the "perf" argument would probably be false as you do not want the instances to perform their Create and Destroy/Clean Up events.
 * 
 * @param {object} obj The new object the calling object will change into.
 * @param {boolean} perf Whether to perform that new object's Create and Destroy events (true) or not (false).
 */
function instance_change(obj, perf) {
  console.warn("STUB: instance_change.", obj, perf)
  return;
}

export { audio_play_sound, audio_is_playing, audio_stop_all, audio_stop_sound, audio_sound_gain, audio_sound_pitch, draw_get_font, draw_set_color, draw_set_font, draw_text, draw_text_transformed, keyboard_check,  keyboard_check_pressed, currentDrawColor, currentFont, room_goto, instances, instance_create, instance_destroy, instance_exists, draw_sprite, draw_sprite_ext, string_char_at, floor, ceil, round, random, surface_get_width, script_execute, real, draw_rectangle, ord, draw_sprite_part, draw_sprite_part_ext, draw_background, string_delete, merge_color, secondFont, thirdFont, room_next, room_previous, room_goto_next, room_goto_previous, collision_rectangle, collision_point, collision_line, getBoundingBox, ini_open, ini_close, ini_read_string, ini_read_real, ini_write_string, ini_write_real, ini_section_exists, ini_key_exists, ini_key_delete, ini_section_delete, ini_export, ini_import, file_exists, choose, draw_circle, ds_map_add, ds_map_create, ds_map_find_value, string_copy, string_length, string, room_get_name, point_distance, distance_to_point, move_towards_point, _with, abs, instance_number, action_move, audio_resume_sound, audio_pause_sound, instance_find, instance_change };