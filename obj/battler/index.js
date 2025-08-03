import {
  _with,
  draw_sprite,
  draw_sprite_ext,
  instance_create,
  instance_destroy,
  instances,
  room_goto,
} from "/imports/assets/gamemakerFunctions.js";
import {
  caster_pause,
  caster_set_volume,
  snd_play,
} from "/imports/customFunctions.js";
import { c_white, snd_noise } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_fader from "/obj/fader/index.js";
import * as obj_mainchara from "/obj/mainchara/index.js";
import * as obj_tempblack from "/obj/tempblack/index.js";
import * as obj_transheart from "/obj/transheart/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.interact = 3;
  alarm[2] = 30;
  alarm[4] = 1;
  global.flag[201] = global.kills;

  if (global.flag[15] === 0) {
    caster_set_volume(global.currentsong, 0);
    caster_pause(global.currentsong, 1);
  }

  const tb = instance_create(0, 0, obj_tempblack);

  const self = {
    name: "battler", // sprite name
    depth: -601, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: null, // sprite object
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    heartdraw: 0,
    on: 0,
    clap: 0,
    depp: -600,
    claptimer: 2,
    tb,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    alarm4,
    alarm3,
    alarm2,
    roomEnd,
    draw,
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

function alarm4() {
  if (this.on === 0) {
    if (this.heartdraw === 1) {
      this.heartdraw = 0;
      this.on = 1;
      this.clap += 1;
    }
  }

  if (this.on === 0) {
    if (this.heartdraw === 0) {
      snd_play(snd_noise);
      this.on = 1;
      this.heartdraw = 1;
    }
  }

  this.on = 0;

  if (this.clap > 2) {
    if (global.battlegroup === 200) {
      _with(this.tb, function () {
        instance_destroy(this);
      });

      instance_destroy(this);
    } else {
      const mainchara = instances.get(obj_mainchara)[0];
      instance_create(mainchara.x + 5, mainchara.y + 17, obj_transheart);
      this.heartdraw = 0;
      mainchara.depth = 100;
    }
  } else {
    this.alarm[4] = this.claptimer;
  }
}

function alarm3() {
  global.currentroom = `${window.location.href.slice(35, 39)}_${
    window.location.href.slice(40).split("/")[0]
  }`;

  if (global.currentroom !== "room_water_undynehouse") {
    global.room_persistent = window.location.href;
  }

  instance_create(0, 0, obj_fader);
  room_goto("room_battle");
}

function alarm2() {
  this.alarm[3] = 2;
}

function roomEnd() {
  instance_destroy(this);
}

function draw() {
  const mainchara = instances.get(obj_mainchara)[0];
  if (this.clap < 3) {
    mainchara.depth = this.depp;
  }

  if (this.heartdraw === 1) {
    draw_sprite("spr_heartsmall", 0, mainchara.x + 5, mainchara.y + 17);
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  alarm4,
  alarm3,
  alarm2,
  roomEnd,
  draw,
};
