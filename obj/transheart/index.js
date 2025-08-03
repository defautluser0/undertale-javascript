import {
  distance_to_point,
  draw_sprite_ext,
  move_towards_point,
} from "/imports/assets/gamemakerFunctions.js";
import { snd_play } from "/imports/customFunctions.js";
import { view_current, view_xview, view_yview } from "/imports/view.js";
import { c_white, snd_battlefall } from "/imports/assets.js";
import global from "/imports/assets/global.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  let xx = view_xview[view_current];
  let yy = view_yview[view_current];
  alarm[0] = 0;
  let mychoicex = xx + 20;
  let mychoicey = yy + 223;
  let spdr;

  if (
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/area1_2/" ||
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/tundra_paproom/"
  ) {
    mychoicex = xx + 154;
    mychoicey = yy + 156;
  }

  if (
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/water_undynefinal/" ||
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/water_undynefinal2/" ||
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/water_undynefinal3/" ||
    window.location.href === "https://undertale.defautluser0.xyz/room/fire1/"
  ) {
    mychoicex = xx + 156;
    mychoicey = yy + 116;
  }

  const self = {
    name: "transheart", // sprite name
    depth: -600, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by creation
    y: 0, // object y. this is set by creation
    xstart: 0, // start x
    ystart: 0, // start y
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_heartsmall", // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    xx: xx,
    yy: yy,
    mode: 0,
    mychoicex: mychoicex,
    mychoicey: mychoicey,
    spdr: spdr,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    alarm0,
    step,
  };

  self._hspeed = 0;
  self._vspeed = 0;
  self._speed = 0;
  self._direction = 0;
  self._path = {
    data: {},
    index: 1,
    speed: 0,
    endaction: "",
    absolute: false,
    xOffset: 0,
    yOffset: 0,
  };
  self._x = 0;
  self._y = 0;
  self.initialspeed = null;

  Object.defineProperty(self, "hspeed", {
    get() {
      return this._hspeed;
    },
    set(val) {
      this._hspeed = val;
      this._manualVel = true;
      this._updatePolarFromCartesian();
    },
  });

  Object.defineProperty(self, "vspeed", {
    get() {
      return this._vspeed;
    },
    set(val) {
      this._vspeed = val;
      this._manualVel = true;
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

  Object.defineProperty(self, "path_index", {
    get() {
      return this._path.data;
    },
    set(val) {
      this._path.data = val;
    },
  });

  Object.defineProperty(self, "path_speed", {
    get() {
      return this._path.speed;
    },
    set(val) {
      this._path.speed = val;
    },
  });

  Object.defineProperty(self, "path_endaction", {
    get() {
      return this._path.endaction;
    },
    set(val) {
      this._path.endaction = val;
    },
  });

  Object.defineProperty(self, "x", {
    get() {
      return this._x;
    },
    set(val) {
      this._x = val;
      this._manualPos = true;
    },
  });

  Object.defineProperty(self, "y", {
    get() {
      return this._y;
    },
    set(val) {
      this._y = val;
      this._manualPos = true;
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
    } else if (this.alarm[i] === 0) {
      const handler = this[`alarm${i}`];
      if (typeof handler === "function") handler.call(this); // call with instance context
      this.alarm[i]--;
    }
  }
}

function updateGamemakerFunctions() {
  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }

  // apply friction
  if (this.friction !== 0 && this.speed > 0) {
    this.speed -= this.friction;
    if (this.speed < 0) this.speed = 0;
  }

  // apply gravity vector
  if (this.gravity) {
    let gravRad = this.gravity_direction * (Math.PI / 180);
    this.hspeed += Math.cos(gravRad) * this.gravity;
    this.vspeed -= Math.sin(gravRad) * this.gravity;

    // recalculate speed and direction based on new velocity
    this.speed = Math.sqrt(
      this.hspeed * this.hspeed + this.vspeed * this.vspeed
    );
    this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
  }

  // update position
  this.x += this.hspeed;
  this.y += this.vspeed;
}

function updateSprite() {
  if (this.visible === true) {
    draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      0,
      c_white,
      this.image_alpha
    );
  }
}

function roomStart() {
  this.spdr = distance_to_point.call(this, this.mychoicex, this.mychoicey) / 17;
  move_towards_point.call(this, this.mychoicex, this.mychoicey, this.spdr);
  snd_play(snd_battlefall);

  if (global.flag[16] === 1) {
    this.x = this.xstart;
    this.y = this.ystart;
    this.mychoicex = this.xx + 154;
    this.mychoicey = this.yy + 156;
    this.spdr =
      distance_to_point.call(this, this.mychoicex, this.mychoicey) / 8;
    move_towards_point.call(this, this.mychoicex, this.mychoicey, this.spdr);
    snd_play(snd_battlefall);
  }
}

function alarm0() {
  this.xx = view_xview[view_current];
  this.yy = view_yview[view_current];
  this.mode = 0;
  this.mychoicex = this.xx + 20;
  this.mychoicey = this.yy + 223;

  if (
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/area1_2/" ||
    window.location.href ===
      "https://undertale.defautluser0.xyz/room/tundra_paproom/"
  ) {
    this.mychoicex = this.xx + 154;
    this.mychoicey = this.yy + 156;
  }

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/water_undynefinal/"
  ) {
    this.mychoicex = this.xx + 154;
    this.mychoicey = this.yy + 110;
  }

  this.spdr = distance_to_point.call(this, this.mychoicex, this.mychoicey) / 17;
  move_towards_point.call(this, this.mychoicex, this.mychoicey, this.spdr);

  if (global.flag[16] == 1) {
    this.mychoicex = this.xx + 154;
    this.mychoicey = this.yy + 156;
    this.spdr =
      distance_to_point.call(this, this.mychoicex, this.mychoicey) / 8;
    move_towards_point.call(this, this.mychoicex, this.mychoicey, this.spdr);
  }
}

function step() {
  if (
    Math.abs(this.x - this.mychoicex) < this.speed &&
    Math.abs(this.y - this.mychoicey) < this.speed
  ) {
    this.x = this.mychoicex;
    this.y = this.mychoicey;
    this.speed = 0;
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  alarm0,
  step,
};
