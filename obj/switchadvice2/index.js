import {
  draw_sprite_ext,
  getBoundingBox,
  instance_create,
  instance_destroy,
  script_execute,
} from "/imports/assets/gamemakerFunctions.js";
import { scr_depth, scr_gettext } from "/imports/customFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object. if none, delete this line and any references
//                                                               // to this fake object
import * as obj_dialoguer from "/obj/dialoguer/index.js";
import * as parent from "/obj/readable/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "switchadvice2", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_tornote", // sprite object
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,
    create2: true, // for createContext() to be called (true) or roomStart() to be called (false) on creation

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    updateCol,
    followPath,
    createContext,
    step,
    alarm0,
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

  getBoundingBox.call(this);

  this.previousx = this.x;
  this.xprevious = this.x;
  this.previousy = this.y;
  this.yprevious = this.y;

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

function followPath() {
  const pathState = this._path;
  if (!pathState || !pathState.data.points) return;

  const points = pathState.data.points;
  const keys = Object.keys(points)
    .map(Number)
    .sort((a, b) => a - b);

  let currKey = pathState.index;
  let nextKeyIndex = keys.indexOf(currKey) + 1;

  if (nextKeyIndex >= keys.length) {
    if (pathState.data.closed) {
      nextKeyIndex = 0;
    } else {
      switch (pathState.endaction) {
        case "path_action_stop":
          this.x = points[currKey].x;
          this.y = points[currKey].y;
          this.speed = 0;
          return;
        case "path_action_loop":
          pathState.index = keys[0];
          nextKeyIndex = 1;
          break;
        default:
          return;
      }
    }
  }

  const next = points[keys[nextKeyIndex]];

  let unupdated = this._manualPos;

  const dx = next.x - this.x;
  const dy = next.y - this.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= pathState.speed) {
    this.x = next.x;
    this.y = next.y;
    if (!unupdated) this._manualPos = false;
    pathState.index = keys[nextKeyIndex];
  } else {
    this.x += (dx / dist) * pathState.speed;
    this.y += (dy / dist) * pathState.speed;
    if (!unupdated) this._manualPos = false;
  }

  // apply GMS1.x-like direction update quirk
  if (
    this.initialspeed === 0 &&
    this.path_speed > 0 &&
    !this._manualVel &&
    !this._manualPos
  ) {
    const radians = Math.atan2(
      -(this.y - this.yprevious),
      this.x - this.xprevious
    );
    const degrees = (radians * 180) / Math.PI;
    this.direction = (degrees + 360) % 360;
  }
}

function updateCol() {
  // let other = collision_rectangle.call(
  //   this,
  //   this.bbox_left,
  //   this.bbox_top,
  //   this.bbox_right,
  //   this.bbox_bottom,
  //   obj_solidobject,
  //   false,
  //   false
  // );
  // if (other) {
  //   collision updates with an object here. other
  //   is the colliding instance, so use
  //   other.property for instance properties, like
  //   x, y and such.
  // }
  // to add more collision checks, set other to
  // collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject2, false, false);,
  // obj_solidobject2 being a different solid object
  // and do another if (other) {} to run scripts.
}

function createContext() {
  // here goes anything to do when you need context creation, so like calling any script with context you do here
  script_execute.call(this, scr_depth);

  if (global.flag[6] === 1) {
    instance_destroy(this);
  }
}

function step() {
  this.parent.step.call(this);
}

function alarm0() {
  this.myinteract = 3;
  global.msc = 0;
  global.typer = 5;
  global.facechoice = 0;
  global.faceemotion = 0;
  global.msg[0] = scr_gettext("obj_switchadvice2_61"); // * Please press this switch&  too.&             - TORIEL/%%
  this.mydialoguer = instance_create(0, 0, obj_dialoguer);
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  followPath,
  updateCol,
  parent,
  createContext,
  step,
  alarm0,
};
