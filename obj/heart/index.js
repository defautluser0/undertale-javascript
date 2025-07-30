import { draw_sprite_ext, instance_find, instance_number, keyboard_check, instance_exists, getBoundingBox, collision_rectangle } from "/imports/assets/gamemakerFunctions.js";
import { snd_play } from "/imports/customFunctions.js"
import { c_white } from "/imports/assets.js";
import { control_check_pressed, control_check, vk_up, vk_down, vk_left, vk_right } from "/imports/input.js"
import global from "/imports/assets/global.js";

import * as obj_battlecontroller from "/obj/battlecontroller/index.js";
import * as obj_uborder from "/obj/uborder/index.js";
import * as obj_rborder from "/obj/rborder/index.js";
import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_lborder from "/obj/lborder/index.js";
const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.sp = global.asp;

  const self = {
    name: "heart", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 2, // sprite frame number
    image_angle: 0,
    sprite_index: "spr_heart", // sprite object
    visible: true, // sprite visibility
    parent: parent,
    create2: true,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    movement: 1,
    hgo: 0,
    vgo: 0,
    shot: 0,
    confuse: 0,
    charge: 0,
    ignore_border: 0,
    slam_pain: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateIndex,
    updateSpeed,
    updateSprite,
    createContext,
    step,
    updateKeyboard,
    user7,
    updateCol,
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

function updateIndex() {
  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
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
  if (this.visible === true) {
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

function createContext() {
  global.bmenuno = 0;
  global.bmenucoord[0] = 0;
  global.bmenucoord[1] = 0;
  global.bmenucoord[2] = 0;
  global.bmenucoord[3] = 0;
  global.bmenucoord[4] = 0;
  global.bmenucoord[6] = 0;
  global.bmenucoord[7] = 0;
  global.bmenucoord[8] = 0;
  global.bmenucoord[9] = 0;
  global.bmenucoord[10] = 0;
  global.hurtanim[0] = 0;
  global.hurtanim[1] = 0;
  global.hurtanim[2] = 0;
  global.hurtanim[3] = 0;
  global.myfight = 0;
  global.mnfight = 0;
  global.xpreward[3] = 0;
  global.goldreward[3] = 0;
}

function step() {
  const lborder = instance_find(obj_lborder, 0);
  const rborder = instance_find(obj_rborder, 0);
  const uborder = instance_find(obj_uborder, 0);
  const dborder = instance_find(obj_dborder, 0);
  if (global.mnfight !== 2) {
    this.movement = 0;
  } else if (this.movement === 0) {
    this.movement = 1;
  }

  global.invc -= 1;

  if (global.invc > 0 || instance_find(obj_battlecontroller, 0).runaway === 1) {
    this.image_speed = 0.5;
  } else {
    this.image_speed = 0;
    this.image_index = 0;
  }

  this.charge -= 1;

  if (this.shot === 1 && control_check_pressed(0) && global.mnfight === 2) {
    if (instance_number(obj_heartshot) === 0 || this.charge < 0) {
      this.charge = 14;
      instance_create(this.x + 4, this.y + 2, obj_heartshot);
      snd_play(snd_heartshot);
    }
  }

  if (this.sprite_index === "spr_confuseheart") {
    this.image_angle += 6;
  }

  if (this.confuse === 1 && global.mnfight === 2) {
    if (this.x < (lborder.x + 8)) {
      this.x = lborder.x + 8;
    }

    if (this.y < (uborder.x + 8)) {
      this.y = uborder.x + 8;
    }

    if (this.x > (rborder.x - 8)) {
      this.x = rborder.x - 8;
    }

    if (this.y > (dborder.x - 8)) {
      this.y = dborder.x - 8;
    }
  }

  if (this.movement === 11) {
    this.vspeed = 0;

    if (global.up) {
      this.y -= global.sp;
    }

    if (global.down) {
      this.y += global.sp;
    }

    if (global.left) {
      if (this.jumpstage === 1 && this.hpseed === 0) {
        this.jumpstage = 2;
        this.hpseed = -6;
      }
    }
  }

  if (this.movement === 12) {
    this.hspeed = 0;

    if (global.left) {
      this.x -= global.sp;
    }

    if (global.right) {
      this.x += global.sp;
    }

    if (global.down) {
      if (this.jumpstage === 1 && this.vpseed === 0) {
        this.jumpstage = 2;
        this.vpseed = 6;
      }
    }
  }

  if (this.movement === 13) {
    this.vspeed = 0;

    if (global.up) {
      this.y -= global.sp;
    }

    if (global.down) {
      this.y += global.sp;
    }

    if (global.right) {
      if (this.jumpstage === 1 && this.hpseed === 0) {
        this.jumpstage = 2;
        this.hpseed = 6;
      }
    }
  }

  if (this.jumpstage == 2 && this.movement == 2)
{
    if (keyboard_check(vk_up) == 0 && this.vspeed <= -1)
      this.vspeed = -1;
    
    if (this.vspeed > 0.5 && this.vspeed < 8)
        this.vspeed += 0.6;
    
    if (this.vspeed > -1 && this.vspeed <= 0.5)
        this.vspeed += 0.2;
    
    if (this.vspeed > -4 && this.vspeed <= -1)
        this.vspeed += 0.5;
    
    if (this.vspeed <= -4)
        this.vspeed += 0.2;
}

if (this.jumpstage == 2 && this.movement == 11)
{
    if (keyboard_check(vk_left) == 0 && this.hspeed <= -1)
      this.hspeed = -1;
    
    if (this.hspeed > 0.5 && this.hspeed < 8)
        this.hspeed += 0.6;
    
    if (this.hspeed > -1 && this.hspeed <= 0.5)
        this.hspeed += 0.2;
    
    if (this.hspeed > -4 && this.hspeed <= -1)
        this.hspeed += 0.5;
    
    if (this.hspeed <= -4)
        this.hspeed += 0.2;
}

  if (this.jumpstage == 2 && this.movement == 12)
  {
    if (keyboard_check(vk_down) == 0 && this.vspeed >= 1)
      this.vspeed = 1;
    
    if (this.vspeed < -0.5 && this.vspeed > -8)
      this.vspeed -= 0.6;
    
    if (this.vspeed < 1 && this.vspeed >= -0.5)
      this.vspeed -= 0.2;
    
    if (this.vspeed < 4 && this.vspeed >= 1)
      this.vspeed -= 0.5;
    
    if (this.vspeed >= 4)
      this.vspeed -= 0.2;
  }

  if (this.jumpstage == 2 && this.movement == 13)
  {
    if (keyboard_check(vk_right) == 0 && this.hspeed >= 1)
      this.hspeed = 1;

    if (this.hspeed < -0.5 && this.hspeed > -8)
        this.hspeed -= 0.6;
    
    if (this.hspeed < 1 && this.hspeed >= -0.5)
        this.hspeed -= 0.2;
    
    if (this.hspeed < 4 && this.hspeed >= 1)
        this.hspeed -= 0.5;
    
    if (this.hspeed >= 4)
        this.hspeed -= 0.2;
  }

  if (this.ignore_border === 0 && instance_exists("obj_sansb_body") && global.mnfight === 2) {
    console.log("what how");
  }

  if (instance_exists(obj_battlecontroller)) {
    if (instance_find(obj_battlecontroller, 0).runaway === 1 && this.x < -20) {
      if (!instance_exists(obj_unfader)) {
        instance_create(0, 0, obj_unfader);
      }

      if (this.x < -60) {
        if (global.flag[15] === 0) {
          caster_stop(global.batmusic);
          caster_free(global.batmusic);
        }

        room_goto(global.currentroom);
      }
    }
  }
}

function updateKeyboard() {
  if (keyboard_check(vk_down)) {
    if (this.movement === 1) {
      if (this.confuse === 0) {
        this.y += global.sp;

        if (control_check(1) === 1) {
          this.y -= (global.sp / 2);
        }
      }

      if (this.confuse === 1) {
        this.y -= global.sp;

        if (control_check(1) === 1) {
          this.y += (global.sp / 2);
        }
      }
    }
  }

  if (keyboard_check(vk_right)) {
    if (this.movement === 1 || this.movement === 2) {
      if (this.confuse === 0) {
        this.x += global.sp;

        if (control_check(1) === 1) {
          this.x -= (global.sp / 2);
        }
      }
      
      if (this.confuse === 1 && this.x < (global.idealborder[0] + 8)) {
        this.x -= global.sp;

        if (control_check(1) === 1) {
          this.x += (global.sp / 2);
        }
      }
    }
  }

  if (keyboard_check(vk_up)) {
    if (this.movement === 1) {
      if (this.confuse === 0) {
        this.y -= global.sp;

        if (control_check(1) === 1) {
          this.y += (global.sp / 2);
        }
      }

      if (this.confuse === 1) {
        this.y += global.sp;

        if (control_check(1) === 1) {
          this.y -= (global.sp / 2);
        }
      }
    }

    if (this.movement === 2) {
      if (this.jumpstage === 1 && this.vspeed === 0) {
        this.jumpstage = 2;
        this.vspeed = -6;
      }
    }
  }

  if (keyboard_check(vk_left)) {
    if (this.movement === 1 || this.movement === 2) {
      if (this.confuse === 0) {
        this.x -= global.sp;

        if (control_check(1) === 1) {
          this.x += (global.sp / 2);
        }
      }
      
      if (this.confuse === 1 && this.x < (global.idealborder[1] - 8)) {
        this.x += global.sp;

        if (control_check(1) === 1) {
          this.x -= (global.sp / 2);
        }
      }
    }
  }
}

function user7() {
  console.log("quit it");
}

function updateCol() {
  getBoundingBox.call(this);

  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_dborder, false, false);
  if (other && other.solid) {
    this.x = this.xprevious;
  }
  if (other) {
    if (this.ignore_border === 0) {
      this.y = other.y - this.sprite_height
    }

    if (this.movement === 2) {
      this.user7();
      this.jumpstage = 1;
      this.vspeed = 0;
    }

    if (this.confuse === 1 && instance_find(obj_battlecontroller).runaway !== 1) {
      this.y = other.y - 8;
    }
  }
}

export { create, updateAlarms, updateIndex, updateSpeed, updateSprite, parent, createContext, step, updateKeyboard, user7, updateCol };
