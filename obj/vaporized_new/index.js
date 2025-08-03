import {
  _with,
  buffer_create,
  buffer_delete,
  buffer_get_surface,
  buffer_peek,
  draw_clear_alpha,
  draw_sprite,
  draw_sprite_ext,
  floor,
  instance_create,
  instance_destroy,
  make_colour_rgb,
  surface_create,
  surface_free,
  surface_reset_target,
  surface_set_target,
} from "/imports/assets/gamemakerFunctions.js";
import { snd_play } from "/imports/customFunctions.js";
import { c_black, c_white, snd_vaporized } from "/imports/assets.js";

// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object. if none, delete this line and any references
//                                                               // to this fake object
import * as obj_whtpxlgrav from "/obj/whtpxlgrav/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "vaporized_new", // sprite name
    depth: 50, // object depth
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
    sprite_index: null, // sprite object
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,
    create2: true, // for createContext() to be called (true) or roomStart() to be called (false) on creation

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    delay: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateSpeed,
    updateIndex,
    updateSprite,
    updateCol,
    followPath,
    createContext,
    draw,
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
  if (this.visible === true && this.sprite_index) {
    const img = draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      this.image_angle,
      c_white,
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
  snd_play(snd_vaporized);
}

function draw() {
  this.updateSprite();
  this.w = this.sprite_width * this.image_xscale;
  this.h = this.sprite_height * this.image_yscale;
  this.xoff = 0 * this.image_xscale; // TODO: implement dynamic offset getting
  this.yoff = 0 * this.image_yscale; // TODO: implement dynamic offset getting
  this.x -= this.xoff;
  this.y -= this.yoff;
  this.surf = surface_create(this.w, this.h);
  surface_set_target(this.surf);
  draw_clear_alpha(c_black, 0);
  draw_sprite(this.sprite_index, this.image_index, this.xoff, this.yoff);
  surface_reset_target();
  this.buff = buffer_create(4 * this.w * this.h, "buffer_fixed", 1);
  buffer_get_surface(this.buff, this.surf, 0, 0, 0);
  surface_free(this.surf);
  this.blarg = 0;

  if (this.image_xscale === 2) {
    this.blarg = 1;
  } else {
    this.blarg = 2;
  }

  for (let j = 0; j < this.h; j += this.blarg) {
    for (let i = 0; i < this.w; i += this.blarg) {
      this.pixel = buffer_peek(this.buff, 4 * (i + j * this.w), "buffer_u32");
      this.a = (this.pixel >> 24) & 255;
      this.r = this.pixel & 255;
      this.g = (this.pixel >> 8) & 255;
      this.b = (this.pixel >> 16) & 255;
      this.obj = null;

      if (this.a === 255) {
        this.obj = obj_whtpxlgrav;
        this.col = make_colour_rgb(this.b, this.g, this.r);
      }

      if (this.obj !== null) {
        this._obj = instance_create(
          this.x + i * this.image_xscale,
          this.y + j * this.image_yscale,
          this.obj
        );

        _with.call(this, this._obj, function () {
          this.image_blend = this.other.col;
          this.delay = floor(this.other.delay / 3);
        });
      }
    }

    this.delay += 1;
  }

  buffer_delete(this.buff);
  instance_destroy(this);
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
  draw,
};
