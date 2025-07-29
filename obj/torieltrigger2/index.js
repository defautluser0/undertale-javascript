import { draw_sprite_ext, getBoundingBox, collision_rectangle, instance_destroy, instance_find, instance_create, _with, path_end, path_start, instance_exists } from "/imports/assets/gamemakerFunctions.js";
import { c_white, path_torielwalk3, path_torielwalk3_2, path_walkright, path_torielwalk2_2 } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_mainchara from "/obj/mainchara/index.js"; // replace with a valid colliding object. if none, delete this line and any references
                                                          // to this fake object
import * as obj_dialoguer from "/obj/dialoguer/index.js";
import * as obj_toroverworld3 from "/obj/toroverworld3/index.js";
import * as obj_toroverworld4 from "/obj/toroverworld4/index.js";
import * as obj_torinteractable1 from "/obj/torinteractable1/index.js";
import * as obj_torinteractable2 from "/obj/torinteractable2/index.js";
import * as obj_shaker from "/obj/shaker/index.js";
const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "torieltrigger2", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 50, // sprite scale
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_event", // sprite object
    visible: false, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,
    create2: true, // for createContext() to be called (true) or roomStart() to be called (false) on creation

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    conversation: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    updateCol,
    followPath,
    createContext,
    alarm5,
    alarm4,
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

  this.updateCol();
 
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
  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_mainchara, false, false);
  if (other) {
    // collision updates with an object here. other
    // is the colliding instance, so use 
    // other.property for instance properties, like
    // x, y and such.
  }
  // to add more collision checks, set other to 
  // collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject2, false, false);, 
  // obj_solidobject2 being a different solid object 
  // and do another if (other) {} to run scripts.
}

function createContext() {
  // here goes anything to do when you need context creation, so like calling any script with context you do here
  if (global.plot > 4.5) {
    instance_destroy(this);
  }

  if (global.plot === 4) {
    this.conversation = 2.5;
  }

  if (global.plot === 4.5) {
    this.conversation = 4;
  }
}

function alarm5() {
  path_end.call(this);
  instance_find(obj_toroverworld3, 0).direction = 270;
  global.msc = 203;
  instance_create(0, 0, obj_dialoguer);
  this.conversation = 3;
}

function alarm4() {
  _with (obj_toroverworld3, function() {
    path_start.call(this, path_torielwalk2_2, 3, "path_action_stop", true);
  })

  this.alarm[5] = 40;
}

function step() {
  if (this.conversation === 0 && (instance_find(obj_mainchara, 0).x > 140 || instance_find(obj_mainchara, 0).y < 170)) {
    global.msc = 204;
    global.typer = 4;
    global.interact = 1;
    global.facechoice = 1;
    instance_create(0, 0, obj_dialoguer);
    this.conversation = 1;
  }

  if (this.conversation === 1 && !instance_exists(obj_dialoguer)) {
    global.interact = 0;
    this.conversation = 2;
    _with (obj_toroverworld4, function() {
      path_start.call(this, path_torielwalk3, 3.25, "path_action_stop", true);
    })
  }

  if (instance_exists(obj_toroverworld4)) {
    if (this.conversation === 2 && instance_find(obj_toroverworld4, 0).path_position === 1) {
      this.conversation = 2.5;

      _with (obj_toroverworld4, function() {
        path_end.call(this);
      })

      if (global.plot < 4) {
        global.plot = 4;
        instance_create(instance_find(obj_toroverworld4, 0).x, instance_find(obj_toroverworld4, 0).y, obj_torinteractable1);
      }

      _with (obj_toroverworld4, function() {
        instance_destroy(this);
      })
    }
  }

  if (this.conversation === 2.5 && global.plot === 4.5) {
    this.conversation = 3;
    
    if (instance_exists(obj_torinteractable1)) {
      instance_create(instance_find(obj_torinteractable1, 0).x, instance_find(obj_torinteractable1, 0).y, obj_toroverworld4);

      _with (obj_torinteractable1, function() {
        instance_destroy(this)
      })

      _with (obj_toroverworld4, function() {
        path_start.call(this, path_torielwalk3_2, 3, "path_action_stop", true);
      })
    }
  }

  if (instance_exists(obj_toroverworld4)) {
    if (this.conversation === 3 && instance_find(obj_toroverworld4, 0).path_position === 1) {
      this.conversation = 4;

      _with (obj_toroverworld4, function() {
        path_end.call(this);
      })

      instance_create(instance_find(obj_toroverworld4, 0).x, instance_find(obj_toroverworld4, 0).y, obj_torinteractable2);

      _with (obj_toroverworld4, function() {
        instance_destroy(this);
      })
    }
  }

  if (this.conversation === 4 && global.plot === 5 && !instance_exists(obj_shaker)) {
    this.conversation = 3;
    
    if (instance_exists(obj_torinteractable2)) {
      instance_create(instance_find(obj_torinteractable2, 0).x, instance_find(obj_torinteractable2, 0).y, obj_toroverworld4);

      _with (obj_torinteractable2, function() {
        instance_destroy(this)
      })

      _with (obj_toroverworld4, function() {
        this.facing = 3;
        this.sprite_index = this.lsprite;
      })
    }

    global.msc = 210;
    global.typer = 4;
    global.interact = 1;
    global.facechoice = 1;
    instance_create(0, 0, obj_dialoguer);
    this.conversation = 5;
  }

  if (this.conversation === 5 && !instance_exists(obj_dialoguer))
  {
    this.conversation = 6;
    global.interact = 0;
    
    _with (obj_toroverworld4, function() {
      path_start.call(this, path_walkright, 3, "path_action_stop", false);
    })
    
    instance_destroy(this);
  }
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, followPath, updateCol, parent, createContext, alarm5, alarm4, step };
