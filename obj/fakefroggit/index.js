import {
  _with,
  // eslint-disable-next-line no-unused-vars
  collision_rectangle,
  draw_sprite_ext,
  floor,
  // eslint-disable-next-line no-unused-vars
  getBoundingBox,
  instance_create,
  instance_destroy,
  instance_find,
  script_execute,
} from "/imports/assets/gamemakerFunctions.js";
import {
  control_check_pressed,
  scr_gettext,
  scr_mercystandard,
  scr_monsterdefeat,
  scr_monstersetup,
  snd_play,
} from "/imports/customFunctions.js";
import { c_white, snd_damage, snd_ehurt1 } from "/imports/assets.js";
import global from "/imports/assets/global.js";
import roomSize from "/imports/assets/roomSize.js";

import * as obj_dmgwriter from "/obj/dmgwriter/index.js";
// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object & uncomment. if none, you can safely ignore
import * as obj_froghead from "/obj/froghead/index.js";
import * as obj_froglegs from "/obj/froglegs/index.js";
import * as obj_lborder from "/obj/lborder/index.js";
import * as parent from "/obj/monsterparent/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as obj_torieldisapprove from "/obj/torieldisapprove/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "fakefroggit", // sprite name
    depth: 10, // object depth
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
    sprite_index: "spr_froggit", // sprite object
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
    destroy,
    alarm11,
    alarm10,
    alarm8,
    alarm6,
    alarm5,
    alarm3,
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
  scr_monstersetup.call(this, 0, 0, 0, 0, 0);
  this.image_speed = 0;
  this.mypart1 = instance_create(this.x, this.y, obj_froghead);
  this.mypart2 = instance_create(this.x, this.y, obj_froglegs);
  this.hurtanim = 0;
  this.hurtsond = "snd_ehurt1";
  this.talked = 0;
  this.whatiheard = -1;
  this.attacked = 0;
  this.killed = 0;
  global.heard = 0;
  this.takedamage = 0;
  this.mercymod = 3;
  global.flag[30] = 1;
  this.ht = 100;
  this.wd = 100;
}

function destroy() {
  if (
    this.mercymod === 30 &&
    global.monsterhp[this.myself] === global.monstermaxhp[this.myself]
  ) {
    if (
      this.mercymod > 10 &&
      global.monsterhp[this.myself] == global.monstermaxhp[this.myself]
    )
      global.goldreward[3] += 2;
  }

  scr_monsterdefeat.call(this, 0, 0, 0, 0, 0);

  _with(this.mypart1, function () {
    instance_destroy(this);
  });

  _with(this.mypart2, function () {
    instance_destroy(this);
  });
}

function alarm11() {
  this.hspeed = -4;
  this.image_index = 3;
}

function alarm10() {
  _with(this.mypart1, function () {
    instance_destroy(this);
  });

  _with(this.mypart2, function () {
    instance_destroy(this);
  });

  this.image_index = 2;
  this.alarm[11] = 30;
}

function alarm8() {
  snd_play(snd_ehurt1);
}

function alarm6() {
  instance_create(
    roomSize.width + 40,
    this.y + this.sprite_height - 204,
    obj_torieldisapprove
  );
  this.alarm[10] = 40;
}

function alarm5() {
  /*yes its empty ingame*/
}

function alarm3() {
  if (this.image_index !== 1) {
    _with(this.mypart1, function () {
      instance_destroy(this);
    });

    _with(this.mypart2, function () {
      instance_destroy(this);
    });

    this.dmgwriter = instance_create(
      this.x + this.sprite_width / 2 - 48,
      this.y - 24,
      obj_dmgwriter
    );
    global.damage = this.takedamage;
    _with(this.dmgwriter, function () {
      this.dmg = global.damage;
    });

    this.image_index = 1;
    snd_play(snd_damage);
    this.alarm[8] = 11;
  }

  this.x += this.shudder;

  if (this.shudder < 0) {
    this.shudder = -(this.shudder + 2);
  } else {
    this.shudder = -this.shudder;
  }

  if (this.shudder === 0) {
    global.hurtanim[this.myself] = 2;
    return;
  }

  this.alarm[3] = 2;
}

function step() {
  if (global.mnfight === 3) {
    this.attacked = 0;
  }

  if (this.alarm[5] > 0) {
    if (global.monster[0] === 1) {
      if (global.monsterinstance[0].alarm[5] > this.alarm[5])
        this.alarm[5] = global.monsterinstance[0].alarm[5];
    }

    if (global.monster[1] === 1) {
      if (global.monsterinstance[1].alarm[5] > this.alarm[5])
        this.alarm[5] = global.monsterinstance[1].alarm[5];
    }

    if (global.monster[2] === 1) {
      if (global.monsterinstance[2].alarm[5] > this.alarm[5])
        this.alarm[5] = global.monsterinstance[2].alarm[5];
    }
  }

  if (global.mnfight == 1) {
    if (this.talked == 0) {
      this.alarm[5] = 60;
      this.alarm[6] = 1;
      this.talked = 1;
      global.heard = 0;
    }
  }

  if (control_check_pressed(0)) {
    if (
      this.alarm[5] > 5 &&
      instance_find(obj_lborder, 0).x === global.idealborder[0]
    ) {
      this.alarm[5] = 2;
    }
  }

  if (global.hurtanim[this.myself] === 1) {
    this.shudder = 16;
    this.alarm[3] = global.damagetimer;
    global.hurtanim[this.myself] = 3;
  }

  if (global.hurtanim[this.myself] === 2) {
    global.monsterhp[this.myself] -= this.takedamage;

    _with(this.dmgwriter, function () {
      this.alarm[2] = 15;
    });

    if (global.monsterhp[this.myself] >= 1) {
      this.mypart1 = instance_create(this.x, this.y, obj_froghead);
      this.mypart2 = instance_create(this.x, this.y, obj_froglegs);
      global.hurtanim[this.myself] = 0;
      this.image_index = 0;
      global.myfight = 0;
      global.mnfight = 1;
    } else {
      global.myfight = 0;
      global.mnfight = 1;
      this.killed = 1;
      instance_destroy(this);
    }
  }

  if (global.hurtanim[this.myself] == 5) {
    global.damage = 0;
    instance_create(
      this.x + this.sprite_width / 2 - 48,
      this.y - 24,
      obj_dmgwriter
    );

    _with(obj_dmgwriter, function () {
      this.alarm[2] = 30;
    });

    global.myfight = 0;
    global.mnfight = 1;
    global.hurtanim[this.myself] = 0;
  }

  if (global.mnfight === 2) {
    if (this.attacked === 0) {
      global.turntimer = 100;
      global.firingrate = 20;
      this.gen = null; // fake froggit that will never fire so dont create

      if (this.command >= 0) {
        global.msg[0] = scr_gettext("obj_fakefroggit_479");
      }

      if (this.command >= 30) {
        global.msg[0] = scr_gettext("obj_fakefroggit_480");
      }

      if (this.command >= 60) {
        global.msg[0] = scr_gettext("obj_fakefroggit_481");
      }

      if (this.command >= 80) {
        global.msg[0] = scr_gettext("obj_fakefroggit_482");
      }

      if (this.mercymod > 5) {
        global.msg[0] = scr_gettext("obj_fakefroggit_483");
      }

      if (global.monsterhp[this.myself] < 5) {
        global.msg[0] = scr_gettext("obj_fakefroggit_484");
      }

      this.attacked = 1;
    }
  }

  if (global.myfight == 2) {
    if (this.whatiheard != -1) {
      if (global.heard == 0) {
        if (this.whatiheard == 0) {
          global.msc = 0;
          global.msg[0] = scr_gettext("obj_fakefroggit_500"); // * FROGGIT - ATK 4 DEF 5&* Life is difficult for&  this enemy./^
          instance_find(OBJ_WRITER, 0).halt = 3;
          this.iii = instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_WRITER
          );

          _with(this.iii, function () {
            this.halt = 0;
          });
        }

        if (this.whatiheard == 3) {
          global.msc = 0;
          global.msg[0] = scr_gettext("obj_fakefroggit_508"); // * Froggit didn't understand&  what you said^1, but was&  flattered anyway./^
          instance_find(OBJ_WRITER, 0).halt = 3;
          this.iii = instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_WRITER
          );

          _with(this.iii, function () {
            this.halt = 0;
          });

          this.mercymod = 30;
        }

        if (this.whatiheard == 1) {
          global.msc = 0;
          global.msg[0] = scr_gettext("obj_fakefroggit_518"); // * Froggit didn't understand&  what you said^1, but was&  scared anyway./^
          instance_find(OBJ_WRITER, 0).halt = 3;
          this.iii = instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_WRITER
          );

          _with(this.iii, function () {
            this.halt = 0;
          });

          this.mercymod = 30;
        }

        global.heard = 1;
      }
    }
  }

  if (global.myfight === 4) {
    if (global.mercyuse === 0) {
      script_execute.call(this, scr_mercystandard);

      if (this.mercy < 0) {
        instance_destroy(this);
      }
    }
  }

  if (this.x < -this.sprite_width) {
    global.monster[this.myself] = 0;
  }
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
  destroy,
  alarm11,
  alarm10,
  alarm8,
  alarm6,
  alarm5,
  alarm3,
  step,
};
