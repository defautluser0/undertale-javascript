import { _key_prev_state, _key_state } from '/imports/input.js';
import { playingSounds, c_white } from '/imports/assets.js'
import { ctx, ogCanvas } from '/imports/canvasSetup.js';
import global from '/imports/assets/global.js';

const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");
offCtx.imageSmoothingEnabled = false;

let currentDrawColor = c_white;
let currentFont = null;
const instances = new Map();

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
  if (!index) return;
  if (!loop && playingSounds.has(index)) {
    playingSounds.get(index).stop();
  }
  index.loop(loop);
  index.volume(gain);

  index.play();
  playingSounds.set(index, index);
  return index;
}
/**
 * This function can be used to change the pitch of a given sound. The sound can either be one referenced from an index for an individual sound being played which has been stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions, or an actual sound asset from the Asset Browser. If it is an index of a playing sound, then only that instance will be changed, however when using a sound asset from the Asset Browser, all instances of that sound asset being played will be changed. The pitch argument is a pitch multiplier, in that the input value multiplies the current pitch by that amount, so the default value of 1 is no pitch change, while a value of less than 1 will lower the pitch and greater than 1 will raise the pitch. It is best to use small increments for this function as any value under 0 or over 5 may not be audible anyway. It is worth noting that the total pitch change permitted is clamped to (1/256) - 256 octaves, so any value over or under this will not be registered.
 * 
 * @param {string} index The index of the sound to change.
 * @param {number} pitch The pitch multiplier (default 1).
 */
function audio_sound_pitch(index, pitch) {
  index.rate(pitch)
}

/**
 * With this function you can fade a sound in or out over a given length of time, or it can be used to set the sound gain instantly. The time is measured in milliseconds, and the function requires that you input a final level of gain for the sound to have reached by the end of that time. This gain can be between 0 (silent) and any value greater than 0, although normally you'd consider the maximum volume as 1. Anything over 1 can be used but, depending on the sound used and the platform being compiled to, you may get distortion or clipping when the sound is played back. Note that the gain scale is linear, and to instantly change the gain, simply set the time argument to 0. This function will affect all instances of the sound that are playing currently in the room if the index is a sound resource, and the final volume will be the volume at which all further instances of the sound will be played. However if you have used the index returned from a function like audio_play_sound() it will only affect that one instance of the sound.
 * 
 * @param {string} index The index of the sound to set the gain for.
 * @param {number} volume Value for the music volume.
 * @param {number} time The length for the change in gain in milliseconds.
 */
function audio_sound_gain(index, volume, time) {
  const id = index._sounds[0]?.id ?? null;
  index.fade(index.volume(), volume, time, id)
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
 * This function will stop the given sound if it is currently playing. The sound can either be a single instance of a sound (the index for individual sounds being played can be stored in a variable when using the audio_play_sound() or audio_play_sound_at() functions) or a sound asset, in which case all instances of the given sound will be stopped.
 * 
 * @param {string} index The index of the sound to stop.
 */
function audio_stop_sound(index) {
  index.stop();
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
  draw_text_transformed(x, y, string, 1, 1, 0);
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
function draw_text_transformed(x, y, string, xscale = 1, yscale = 1, angle = 0) {
  if (currentFont.image === null || currentFont.loading === true) {
    console.warn("Font not set or loaded.");
    return;
  } else {
  ctx.save();

  for (const char of String(string)) {
    const glyph = currentFont.glyphs[char];
    if (!glyph) {
      x += currentFont.size * xscale;
      continue;
    }

    const offsetX = (glyph.offset || 0) * xscale;
    const drawX = x + offsetX;
    const drawY = y;

    // Setup offscreen canvas size for this glyph
    offCanvas.width = glyph.w * xscale;
    offCanvas.height = glyph.h * yscale;

    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    // Draw glyph on offscreen canvas
    offCtx.drawImage(
      currentFont.image,
      glyph.x, glyph.y, glyph.w, glyph.h,
      0, 0,
      offCanvas.width, offCanvas.height
    );

    // Apply tint if currentDrawColor isn't white (c_white)
    if (currentDrawColor.toUpperCase() !== c_white.toUpperCase()) {
      offCtx.globalCompositeOperation = "source-in";
      offCtx.fillStyle = currentDrawColor;
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
      offCtx.globalCompositeOperation = "source-over";
    }

    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.rotate((angle * Math.PI) / 180);

    // Draw tinted glyph from offscreen canvas
    ctx.drawImage(offCanvas, 0, 0);

    ctx.restore();

    x += (glyph.w + (glyph.offset || 0) + (glyph.shift - glyph.w || 0)) * xscale;
  }

  ctx.restore();
  }
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
  currentFont = font;

  if (!currentFont.image && !currentFont.loading) {
    currentFont.loading = true;
    const img = new Image();
    img.src = currentFont.file;
    img.onload = () => {
      currentFont.image = img;
      currentFont.loading = false;
      console.log(`Font image loaded: ${currentFont.file}`);
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
  if (obj === null || !Number.isFinite(x) || !Number.isFinite(y)) {
    console.error("instance_create called with invalid parameters", { x, y, obj })
    throw new Error("instance_create: parameters are invalid")
  }
  const instance = {
    ...obj.create?.(), // get default vars (including x/y defaulting to 0)
    _object: obj,
  };

  // Override x/y *only if explicitly passed*
  instance.x = x;
  instance.y = y;
  
  if (instance.name = "obj_writer") {
    instance.writingx = instance.x + instance.writingx;
    instance.writingy = instance.y + instance.writingy;
  }

  obj.roomStart?.call(instance);

  if (!instances.has(obj)) {
    instances.set(obj, []);
  }

  instances.get(obj).push(instance);
  return instance;
}

/**
 * You call this function whenever you wish to "destroy" an instance, normally triggering a Destroy Event and also a Clean Up Event. This will remove it from the room until the room is restarted (unless the room is persistent). Calling the function will simply destroy all instances of a particular object.
 * 
 * @param {string} index The object asset to destroy instances of
 * @returns {void}
 */
function instance_destroy(index) {
  const list = instances.get(index._object);
  if (list) {
    const i = list.indexOf(index);
    if (i !== -1) list.splice(i, 1);
  }
}


/**
 * This function can be used in two ways depending on what you wish to check. You can give it an object_index to check for, in which case this function will return true if any active instances of the specified object exist in the current room, or you can also supply it with an instance id, in which case this function will return true if that specific instance exists and is active in the current room.
 * 
 * @param {string} obj The object or instance to check for the exsistence  of
 * @returns {boolean}
 */
function instance_exists(obj) {
  return instances.has(obj) && instances.get(obj).length > 0; // true if its in the instances map and if its length is greater than 0
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
  draw_sprite_ext(sprite, subimg, x + sprite.xoffset, y + sprite.yoffset, 1 * sprite.height, 1 * sprite.width, 0, "#ffffff", 1)
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
function draw_sprite_ext(sprite, subimg, x, y, xscale = sprite.xscale, yscale = sprite.yscale, rot = 0, colour = c_white, alpha = 1) {
  if (!sprite || !sprite.path) return;

  // Normalize subimg to valid frame index
  const frame = subimg < 0 ? 0 : subimg % sprite.frameCount;

  const img = new Image();
  img.src = `${sprite.path}${frame}.png`; // e.g. "/spr/introimage/3.png"

  img.onload = () => {
    ctx.save();

    // Translate to position
    ctx.translate(x, y);

    // Rotate (convert degrees to radians)
    ctx.rotate(rot * Math.PI / 180);

    // Scale
    ctx.scale(xscale * sprite.xscale, yscale * sprite.yscale);

    // Apply alpha
    ctx.globalAlpha = alpha;

    // Draw image centered on (0, 0)
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    if (colour && colour !== c_white) {
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = colour;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
  };
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

  // if the floor of the number is divisible by two and rounding the number is not divisible by two and (removing or adding 0.5 from the number is equal to the floor of the number) then return the floor of the number, else return the number rounded
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
  return Math.random * n;
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
  ctx.rect(x1, y1, x2 + x1, y2 + y1)
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

export { audio_play_sound, audio_is_playing, audio_stop_all, audio_stop_sound, audio_sound_gain, audio_sound_pitch, draw_get_font, draw_set_color, draw_set_font, draw_text, draw_text_transformed, keyboard_check,  keyboard_check_pressed, currentDrawColor, currentFont, room_goto, instances, instance_create, instance_destroy, instance_exists, draw_sprite, draw_sprite_ext, string_char_at, floor, ceil, round, random, surface_get_width, script_execute, real, draw_rectangle, ord };