import { draw_sprite_ext, action_move, room_goto, instance_create, _with, instance_destroy, instance_exists, instances } from "/imports/assets/gamemakerFunctions.js";
import { caster_load, caster_loop, scr_textskip } from "/imports/customFunctions.js"
import { c_white, mus_toriel } from "/imports/assets.js";
import roomSize from "/imports/assets/roomSize.js";
import global from "/imports/assets/global.js";

import * as obj_blconwdflowey from "/obj/blconwdflowey/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";
import * as obj_unfader from "/obj/unfader/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.dontfade = 0;
  global.typer = 8;
  global.faceemotion = 1;

  const self = {
    name: "torielcutscene", // sprite name
    depth: 0, // object depth
    image_xscale: 2, // sprite scale
    image_yscale: 2, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 2, // sprite frame number
    image_width: 72,   // placeholder
    image_height: 102, // placeholder
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_torielside1", // sprite object
    visible: true, // sprite visibility
    direction: 0,   // placeholder
    speed: 0,       // placeholder
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    conversation: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    alarm2,
    step,
  };

  self._hspeed = 0;
  self._vspeed = 0;
  self._speed = 0;
  self._direction = 0;

  Object.defineProperty(self, "hspeed", {
    get() {
      return this._hspeed;
    },
    set(val) {
      this._hspeed = val;
      this._updatePolarFromCartesian();
    },
  });

  Object.defineProperty(self, "vspeed", {
    get() {
      return this._vspeed;
    },
    set(val) {
      this._vspeed = val;
      this._updatePolarFromCartesian();
    },
  });

  Object.defineProperty(self, "speed", {
    get() {
      return this._speed;
    },
    set(val) {
      this._speed = val;
      this._updateCartesianFromPolar();
    },
  });

  Object.defineProperty(self, "direction", {
    get() {
      return this._direction;
    },
    set(val) {
      this._direction = val;
      this._updateCartesianFromPolar();
    },
  });

  self._updateCartesianFromPolar = function () {
    const rad = (this._direction * Math.PI) / 180;
    this._hspeed = Math.cos(rad) * this._speed;
    this._vspeed = -Math.sin(rad) * this._speed;
  };

  self._updatePolarFromCartesian = function () {
    this._speed = Math.sqrt(this._hspeed ** 2 + this._vspeed ** 2);
    this._direction = Math.atan2(-this._vspeed, this._hspeed) * (180 / Math.PI);
  };

  return self;
}

function updateAlarms() {
  for (let i = 0; i < this.alarm.length; i++) {
    if (this.alarm[i] > 0) {
      this.alarm[i]--;
      if (this.alarm[i] === 0) {
        const handler = this[`alarm${i}`];
        if (typeof handler === "function") handler.call(this); // call with instance context
      }
    } else if (this.alarm[i] === 0) {
      this.alarm[i]--;
    }
  }
}

function updateGamemakerFunctions() {
  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }

  // getBoundingBox.call(this) // uncomment if bounding box is needed for something (collision checks from this or other objects targetting this)

  // Apply friction
  if (this.friction !== 0 && this.speed > 0) {
    this.speed -= this.friction;
    if (this.speed < 0) this.speed = 0;
  }

  // Apply gravity vector
  if (this.gravity) {
    let gravRad = this.gravity_direction * (Math.PI / 180);
    this.hspeed += Math.cos(gravRad) * this.gravity;
    this.vspeed -= Math.sin(gravRad) * this.gravity;

    // Recalculate speed and direction based on new velocity
    this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
    this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
  }

  // Update position
  this.x += this.hspeed;
  this.y += this.vspeed;
}

function updateSprite() {
  if (this.visible === true) {
    let img = draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      this.image_angle,
      this.image_blend,
      this.image_alpha,
      1,
    );

    if (img) {
      this.sprite_width = img.width;
      this.sprite_height = img.height;
    }
  }
}

function roomStart() {
  action_move.call(this, "000100000", 7);
}

function alarm2() {
  global.border = 0;
  global.plot = 1;
  global.interact = 1;
  global.specialbattle = 1;
  room_goto("room_area1_2");
}

function step() {
  if (this.x < ((roomSize.width / 2) - (this.sprite_width / 2))) {
    if (this.conversation === 0) {
      global.currentsong = caster_load(mus_toriel);
      caster_loop(global.currentsong, 0.7, 0.86);
      this.conversation = 1;
      this.hspeed = 0;
      this.blcon = instance_create((this.x + 40 + this.sprite_width) - 10, this.y + 2, obj_blconwdflowey);
      global.msc = 674;
      this.conversation = 1;
      this.image_speed = 0.2;
      this.blconwriter = instance_create(this.blcon.x + 40, this.blcon.y + 10, OBJ_WRITER);
    }
  }

  this.alarm[0] = 20;

  if (instance_exists(OBJ_WRITER)) {
    if (instances.get(OBJ_WRITER.halt === 0)) {
      this.image_speed = 0.2;
    } else {
      this.image_speed = 0.2;
      this.image_index = 0;
    }
  }

  if (instance_exists(OBJ_WRITER) && this.conversation === 1) {
    scr_textskip();
  }

  if (!instance_exists(OBJ_WRITER)) {
    if (this.conversation === 1) {
      _with (this.blcon, function() {
        instance_destroy(this);
      })

      instance_create(0, 0, obj_unfader);
      this.alarm[2] = 20;
      this.conversation = 2;
      this.image_speed = 0;
      this.image_index = 0;
      this.volume = 1;
    }
  }

  if (global.faceemotion === 1)
    this.sprite_index = "spr_torielside1";

  if (global.faceemotion === 2) 
    this.sprite_index = "spr_torielcutscene";
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, roomStart, alarm2, step };
