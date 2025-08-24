import {
  // eslint-disable-next-line no-unused-vars
  collision_rectangle,
  draw_sprite_ext,
  floor,
  // eslint-disable-next-line no-unused-vars
  getBoundingBox,
  path_start,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white, path_froghead } from "/imports/assets.js";

// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object & uncomment. if none, you can safely ignore

import * as parent from "/obj/monsterparent/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "froghead", // sprite name
    depth: 6, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.02, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_froghead", // sprite object
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
    updateSpeed,
    updateIndex,
    updateSprite,
    updateCol,
    followPath,
    createContext,
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
      if (!Number.isInteger(this.alarm[i]))
        this.alarm[i] = floor(this.alarm[i]);
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

function updateIndex() {
  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
    this.animationEnd?.();
  }
}

function updateSpeed() {
  // apply friction
  if (this.friction !== 0 && this.speed > 0 && Number.isFinite(this.friction)) {
    this.speed -= this.friction;
    if (this.speed < 0) this.speed = 0;
  }

  // apply gravity vector
  if (Number.isFinite(this.gravity)) {
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
  if (this.visible === true && this.sprite_index) {
    const img = draw_sprite_ext(
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

  if (pathState.smooth && pathState.samples) {
    // Move along spline samples array

    let idx = pathState.index;
    const samples = pathState.samples;

    // Current and next sample
    const curr = samples[idx];
    let nextIdx = idx + 1;

    if (nextIdx >= samples.length) {
      if (pathState.data.closed) {
        nextIdx = 0;
      } else {
        switch (pathState.endaction) {
          case "path_action_stop":
            this.x = curr.x;
            this.y = curr.y;
            this.speed = 0;
            return;
          case "path_action_restart":
            nextIdx = 1;
            break;
          case "path_action_continue":
            // Just keep position at last sample
            return;
          case "path_action_reverse":
            samples.reverse();
            nextIdx = 1;
            break;
          default:
            return;
        }
      }
    }

    const next = samples[nextIdx];
    const pointSpeedPercent = next.speed !== undefined ? next.speed / 100 : 1;
    const effectiveSpeed = pathState.speed * pointSpeedPercent;

    const dx = next.x - this.x;
    const dy = next.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= effectiveSpeed) {
      this.x = next.x;
      this.y = next.y;
      pathState.index = nextIdx;
    } else {
      this.x += (dx / dist) * effectiveSpeed;
      this.y += (dy / dist) * effectiveSpeed;
    }
  } else {
    // Original non-smooth followPath logic (use absolute points)
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
          case "path_action_restart":
            pathState.index = keys[0];
            nextKeyIndex = 1;
            break;
          case "path_action_continue":
            break;
          case "path_action_reverse":
            keys.reverse();
            pathState.index = keys[0];
            nextKeyIndex = 1;
            break;
          default:
            return;
        }
      }
    }

    const next = points[keys[nextKeyIndex]];
    const pointSpeedPercent = next.speed !== undefined ? next.speed / 100 : 1;
    const effectiveSpeed = pathState.speed * pointSpeedPercent;

    const dx = next.x - this.x;
    const dy = next.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= effectiveSpeed) {
      this.x = next.x;
      this.y = next.y;
      pathState.index = keys[nextKeyIndex];
    } else {
      this.x += (dx / dist) * effectiveSpeed;
      this.y += (dy / dist) * effectiveSpeed;
    }
  }

  // gms1.x direction update quirk
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
  // uncomment the following line if any collision will happen involving this object
  // getBoundingBox.call(this);
  // uncomment the if statement if said collision is checked by this object
  // let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject, false, false);
  // if (other) {
  // collision updates with an object here. other
  // is the colliding instance, so use
  // other.property for instance properties, like
  // x, y and such.
  //}
  // to add more collision checks, set other to
  // collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject2, false, false);,
  // obj_solidobject2 being a different solid object
  // and do another if (other) {} to run scripts.
}

function createContext() {
  // here goes anything to do when you need context creation, so like calling any script with context you do here
  path_start.call(this, path_froghead, 0.5, "path_action_restart", false);
}

export {
  create,
  updateAlarms,
  updateSpeed,
  updateIndex,
  updateSprite,
  followPath,
  updateCol,
  parent,
  createContext,
};
