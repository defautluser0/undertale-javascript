import {
  _with,
  draw_sprite_ext,
  instance_change,
  instance_create,
  instance_destroy,
  instance_exists,
  instance_find,
  random,
  round,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_face_alphys from "/obj/face_alphys/index.js";
import * as obj_face_asgore from "/obj/face_asgore/index.js";
import * as obj_face_papyrus from "/obj/face_papyrus/index.js";
import * as obj_face_sans from "/obj/face_sans/index.js";
import * as obj_face_torglasses from "/obj/face_torglasses/index.js";
import * as obj_face_torieltalk from "/obj/face_torieltalk/index.js";
import * as obj_face_undyne from "/obj/face_undyne/index.js";
import * as parent from "/obj/torface/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as OBJ_WRITER from "/obj/writer/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "face_torielblink", // sprite name
    depth: -555, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 3, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_face_torielhappyblink", // sprite
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    animationEnd,
    step,
    roomStart,
    alarm9,
    alarm0,
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

    this.animationEnd?.();
  }

  // getBoundingBox.call(this) // uncomment if bounding box is needed for something (collision checks from this or others)

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
    this.speed = Math.sqrt(
      this.hspeed * this.hspeed + this.vspeed * this.vspeed
    );
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
      1
    );
    if (img) {
      this.sprite_width = img.width;
      this.sprite_height = img.height;
    }
  }
}

function animationEnd() {
  this.image_index = 0;
  this.image_speed = 0;
}

function step() {
  if (this.image_index === 0) {
    if (instance_exists(OBJ_WRITER)) {
      if (instance_find(OBJ_WRITER, 0).halt === 0) {
        instance_change.call(this, obj_face_torieltalk, true);
      }
    }
  }

  if (
    global.faceemotion == 0 &&
    this.sprite_index != "spr_face_torielhappyblink"
  )
    this.sprite_index = "spr_face_torielhappyblink";

  if (
    global.faceemotion == 1 &&
    this.sprite_index != "spr_face_torielblinkside"
  )
    this.sprite_index = "spr_face_torielblinkside";

  if (global.faceemotion == 2 && this.sprite_index != "spr_face_torielblink")
    this.sprite_index = "spr_face_torielblink";

  if (global.faceemotion == 3 && this.sprite_index != "spr_face_torielwhat")
    this.sprite_index = "spr_face_torielwhat";

  if (global.faceemotion == 4 && this.sprite_index != "spr_face_torielwhatside")
    this.sprite_index = "spr_face_torielwhatside";

  if (global.faceemotion == 6 && this.sprite_index != "spr_face_torielcold")
    this.sprite_index = "spr_face_torielcold";

  if (global.faceemotion == 7 && this.sprite_index != "spr_face_torielmad")
    this.sprite_index = "spr_face_torielmad";

  if (
    global.faceemotion == 8 &&
    this.sprite_index != "spr_face_torielembarrassed"
  )
    this.sprite_index = "spr_face_torielembarrassed";

  if (
    global.faceemotion == 9 &&
    this.sprite_index != "spr_face_toriel_goawayasgore"
  )
    this.sprite_index = "spr_face_toriel_goawayasgore";
}

function roomStart() {
  parent.roomStart.call(this);
  this.image_speed = 0;
  this.image_index = 0;
  this.alarm[0] = 20 * round(random(30));

  if (instance_exists(obj_face_sans)) {
    _with(obj_face_sans, function () {
      instance_destroy(this);
    });
  }

  if (instance_exists(obj_face_undyne)) {
    _with(obj_face_undyne, function () {
      instance_destroy(this);
    });
  }

  if (instance_exists(obj_face_papyrus)) {
    _with(obj_face_papyrus, function () {
      instance_destroy(this);
    });
  }

  if (instance_exists(obj_face_alphys)) {
    _with(obj_face_alphys, function () {
      instance_destroy(this);
    });
  }

  if (instance_exists(obj_face_asgore)) {
    _with(obj_face_asgore, function () {
      instance_destroy(this);
    });
  }

  if (global.faceemotion === 99) {
    instance_create(this.x, this.x, obj_face_torglasses);
    global.faceemotion = 0;
  }

  if (
    global.faceemotion == 0 &&
    this.sprite_index != "spr_face_torielhappyblink"
  )
    this.sprite_index = "spr_face_torielhappyblink";

  if (
    global.faceemotion == 1 &&
    this.sprite_index != "spr_face_torielblinkside"
  )
    this.sprite_index = "spr_face_torielblinkside";

  if (global.faceemotion == 2 && this.sprite_index != "spr_face_torielblink")
    this.sprite_index = "spr_face_torielblink";

  if (global.faceemotion == 3 && this.sprite_index != "spr_face_torielwhat")
    this.sprite_index = "spr_face_torielwhat";

  if (global.faceemotion == 4 && this.sprite_index != "spr_face_torielwhatside")
    this.sprite_index = "spr_face_torielwhatside";

  if (global.faceemotion == 6 && this.sprite_index != "spr_face_torielcold")
    this.sprite_index = "spr_face_torielcold";

  if (global.faceemotion == 7 && this.sprite_index != "spr_face_torielmad")
    this.sprite_index = "spr_face_torielmad";

  if (
    global.faceemotion == 8 &&
    this.sprite_index != "spr_face_torielembarrassed"
  )
    this.sprite_index = "spr_face_torielembarrassed";

  if (
    global.faceemotion == 9 &&
    this.sprite_index != "spr_face_toriel_goawayasgore"
  )
    this.sprite_index = "spr_face_toriel_goawayasgore";
}

function alarm9() {
  parent.alarm9.call(this);
}

function alarm0() {
  this.image_speed = 0.25;
  this.alarm[0] = 30 + round(random(60));
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  animationEnd,
  step,
  roomStart,
  alarm9,
  alarm0,
};
