import { draw_sprite_ext, getBoundingBox, instance_destroy, power, draw_set_color, round, floor, choose, draw_text, string } from "/imports/assets/gamemakerFunctions.js";
import { ossafe_fill_rectangle, scr_setfont, scr_gettext } from "/imports/customFunctions.js";
import { c_white, c_black, c_dkgray, c_lime, c_red, c_ltgray, fnt_main } from "/imports/assets.js";
import global from "/imports/assets/global.js";

// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object. if none, delete this line and any references
//                                                               // to this fake object
const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  alarm[0] = 1;

  let dmg = global.damage

  const self = {
    name: "dmgwriter", // sprite name
    depth: -2002, // object depth
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
    stretchwidth: global.monsterinstance[global.mytarget].wd,
    stretchfactor: global.monsterinstance[global.mytarget].wd / global.monstermaxhp[global.mytarget],
    apparenthp: global.monsterhp[global.mytarget],
    actualhp: global.monsterhp[global.mytarget],
    maxhp: global.monstermaxhp[global.mytarget],
    negative: 0,
    special: 0,
    dmg: dmg,
    i: 1,
    drawbar: 1,
    numnum: [],

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateSpeed,
    updateIndex,
    updateSprite,
    updateCol,
    followPath,
    createContext,
    alarm2,
    alarm0,
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
  }
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
    }
  })

  Object.defineProperty(self, "path_speed", {
    get() {
      return this._path.speed;
    },
    set(val) {
      this._path.speed = val;
    }
  })

  Object.defineProperty(self, "path_endaction", {
    get() {
      return this._path.endaction;
    },
    set(val) {
      this._path.endaction = val;
    }
  })

  Object.defineProperty(self, "x", {
    get() {
      return this._x;
    },
    set(val) {
      this._x = val
      this._manualPos = true;
    }
  })

  Object.defineProperty(self, "y", {
    get() {
      return this._y;
    },
    set(val) {
      this._y = val
      this._manualPos = true;
    }
  })

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
      if (!Number.isInteger(this.alarm[i])) this.alarm[i] = floor(this.alarm[i])
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
    this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
    this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
  }

  // update position
  this.x += this.hspeed;
  this.y += this.vspeed;
}

function updateSprite() {
  if (this.visible === true && this.sprite_index) {
    draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      this.image_angle,
      c_white,
      this.image_alpha
    );
  }
}

function followPath() {
  const pathState = this._path;
  if (!pathState || !pathState.data.points) return;

  const points = pathState.data.points;
  const keys = Object.keys(points).map(Number).sort((a, b) => a - b);

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
    const radians = Math.atan2(-(this.y - this.yprevious), this.x - this.xprevious);
    const degrees = (radians * 180) / Math.PI;
    this.direction = (degrees + 360) % 360;
  }
}

function updateCol() {
  // getBoundingBox.call(this);
  // let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject, false, false);
  // if (other) {
    // collision updates with an object here. other
    // is the colliding instance, so use 
    // other.property for instance properties, like
    // x, y and such.
  // }
  // to add more collision checks, set other to 
  // collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject2, false, false);, 
  // obj_solidobject2 being a different solid object 
  // and do another if (other) {} to run scripts.
}

function createContext() {
  // here goes anything to do when you need context creation, so like calling any script with context you do here
  if (this.dmg !== 0) {
    this.vspeed = -4;
    this.gravity = 0.5;
    this.gravity_direction = 270;
  }
}

function alarm2() {
  instance_destroy(this._object);
}

function alarm0() {
  if (this.i === 0) {
    this.i = 1;
  } else {
    this.i = 0;
  }

  if (this.apparenthp > (this.actualhp - this.dmg)) {
    this.apparenthp -= (this.dmg / 15);
  } else {
    this.apparenthp = this.actualhp - this.dmg;
  }

  if (this.negative === 0) {
    if (this.apparenthp < 0) {
      this.apparenthp = 0;
    }
  }

  this.alarm[0] = 2;
}

function draw() {
  this.thisnum = this.dmg;

  if (this.thisnum >= 0) {
    this.place = 0;
    this.numadd = 10;

    if (this.thisnum >= this.numadd) {
      do {
        this.place += 1;
        this.numadd *= 10;
      }
      while (this.thisnum >= this.numadd);
    }
  } else {
    this.thisnum = 0;
    this.place = 0;
  }

  this.thisnum2 = this.thisnum;

  for (let i = this.place; i >= 0; i -= 1) {
    this.numnum[i] = floor(this.thisnum2 / power(10, i));
    this.thisnum2 -= (this.numnum[i] * power(10, i));
  }

  if (this.thisnum > 0) {
    if (this.drawbar === 1) {
      draw_set_color(c_black);
      ossafe_fill_rectangle(this.x - 1, this.ystart + 7, this.x + round((global.monstermaxhp[global.mytarget] * this.stretchfactor) + 1), this.ystart + 21);
      draw_set_color(c_dkgray);
      ossafe_fill_rectangle(this.x, this.ystart + 8, this.x + round(global.monstermaxhp[global.mytarget] * this.stretchfactor), this.ystart + 20);
      draw_set_color(c_lime);

      if (this.apparenthp > 0) {
        ossafe_fill_rectangle(this.x, this.ystart + 8, round(this.x + (this.apparenthp * this.stretchfactor)), this.ystart + 20);
      }
    }

    for (let i = this.place; i >= 0; i -= 1) {
      draw_set_color(c_red);

      if (this.stretchwidth <= 120)
        draw_sprite_ext("spr_dmgnum_o", this.numnum[i], ((this.x +30) - (i * 32)) + (this.place * 16), this.y - 28, 1, 1, 0, c_red, 1);
      else
        draw_sprite_ext("spr_dmgnum_o", this.numnum[i], (((this.x - 30) + (this.stretchwidth / 2)) - (i * 32)) + (this.place * 16), this.y - 28, 1, 1, 0, c_red, 1);
    }
  }

  if (this.thisnum === 0) {
    draw_set_color(c_white);

    if (this.special === 0) {
      draw_sprite_ext("spr_dmgmiss_o", 0, this.x - 10, this.y - 16, 1, 1, 0, c_ltgray, 1);
    }

    if (this.special === 1) {
        draw_set_color(c_red);
        scr_setfont(fnt_main);
        this.ex = choose(0, 1, 2, 3, 4, 5);
        draw_text(this.x - 10, this.y - 10, scr_gettext("damage_special_" + string(this.ex)));
    }
  }

  if (this.y > this.ystart) {
    this.y = this.ystart;
    this.vspeed = 0;
    this.gravity = 0;
  }
}

export { create, updateAlarms, updateSpeed, updateIndex, updateSprite, followPath, updateCol, parent, createContext, alarm2, alarm0, draw };
