import { draw_sprite_ext, getBoundingBox, instance_exists, instance_find, instance_destroy, collision_rectangle, _with } from "/imports/assets/gamemakerFunctions.js";
import { scr_depth, scr_npcdir } from "/imports/customFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_toribuster from "/obj/toribuster/index.js";
import * as obj_torface from "/obj/torface/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "toroverworld1", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 4, // sprite frame number
    image_number_t: 2,
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_toriel_d", // sprite object
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    dsprite: "spr_toriel_d",
    usprite: "spr_toriel_u",
    lsprite: "spr_toriel_l",
    rsprite: "spr_toriel_r",
    dtsprite: "spr_toriel_dt",
    utsprite: "spr_toriel_ut",
    ltsprite: "spr_toriel_lt",
    rtsprite: "spr_toriel_rt",
    myinteract: 0,
    facing: 0,
    phone: 0,
    fader: 0,
    fading: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    step,
    updateCol,
  };
  
  self._hspeed = 0;
  self._vspeed = 0;
  self._speed = 0;
  self._direction = 270;

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

  if ((this.sprite_index === this.dtsprite || this.sprite_index === this.utsprite || this.sprite_index === this.ltsprite || this.sprite_index === this.rtsprite) && this.image_index >= this.image_number_t) {
    this.image_index -= this.image_number_t;
  }

  getBoundingBox.call(this) // uncomment if bounding box is needed for something (collision checks from this or others)

	this.previousx = this.x;
	this.xprevious = this.x;
	this.previousy = this.y;
	this.yprevious = this.y;
 
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
      this.sprite_height = img.height
    }
  }
}

function roomStart() {
  scr_depth.call(this, 0, 0, 0, 0, 0)

  if (window.location.href === "https://undertale.defautluser0.xyz/room/basement3" || window.location.href === "https://undertale.defautluser0.xyz/room/basement4") {
    this.facing = 2;
    this.direction = 90;
    this.sprite_index = "spr_toriel_u"
  }

  global.plot = 1;
}

function step() {
  scr_depth.call(this, 0, 0, 0, 0, 0);

  if (instance_exists(obj_torface)) {
    this.myinteract = 1;
    if (instance_exists(OBJ_WRITER)) {
      if (instance_find(OBJ_WRITER, 0).halt !== 0) {
        this.image_speed = 0.2
      }
    }
  } else {
    this.myinteract = 0;
    if (this.speed === 0) {
      this.image_index = 0;
      this.image_speed = 0;
    }

    if (this.speed > 0) {
      this.image_speed = 0.2;
    }
  }

  scr_npcdir.call(this, 0);

  if (window.location.href === "https://undertale.defautluser0.xyz/room/area1_2/" && this.y < 140) {
    this.fader = 1;
  }

  if (this.fader === 1) {
    this.image_alpha -= 0.2;

    if (this.image_alpha <= 0.2) {
      instance_destroy(this)
    }
  }
}

function updateCol() {
  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_toribuster, false, false)
  if (other) {
    _with (this._object, function() {
      instance_destroy(this);
    })
  }
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, roomStart, step, updateCol };
