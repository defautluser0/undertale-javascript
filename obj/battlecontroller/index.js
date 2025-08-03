import {
  _with,
  audio_stop_sound,
  ceil,
  draw_rectangle,
  draw_set_color,
  draw_sprite_ext,
  instance_create,
  instance_exists,
  instance_find,
  instance_number,
  keyboard_check_pressed,
  ord,
  room_goto,
  script_execute,
  string,
  string_char_at,
  string_length,
} from "/imports/assets/gamemakerFunctions.js";
import {
  caster_free,
  caster_load,
  caster_loop,
  caster_stop,
  ossafe_fill_rectangle,
  scr_attack,
  scr_battlegroup,
  scr_battlemenu_cursor_y,
  scr_binfowrite,
  SCR_BORDERSETUP,
  scr_enable_screen_border,
  scr_gameoverb,
  scr_gettext,
  scr_itemnameb,
  scr_itemuseb,
  scr_levelup,
  scr_runaway,
  snd_isplaying,
  snd_play,
  strlen,
} from "/imports/customFunctions.js";
import {
  control_check,
  control_check_pressed,
  control_clear,
  vk_down,
  vk_left,
  vk_right,
  vk_up,
} from "/imports/input.js";
import {
  c_black,
  c_lime,
  c_red,
  c_white,
  mus_battle1,
  mus_toomuch,
  snd_levelup,
  snd_power,
  snd_select,
  snd_squeak,
} from "/imports/assets.js";
import global from "/imports/assets/global.js";
import { SCR_TEXT } from "/imports/assets/text.js";

import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_heart from "/obj/heart/index.js";
import * as OBJ_INSTAWRITER from "/obj/instawriter/index.js";
import * as obj_lborder from "/obj/lborder/index.js";
import * as obj_rborder from "/obj/rborder/index.js";
import * as obj_talkbt from "/obj/talkbt/index.js";
import * as obj_uborder from "/obj/uborder/index.js";
// import * as obj_solidobject from "/obj/solidobject/index.js"; // replace with a valid colliding object. if none, delete this line and any references
//                                                               // to this fake object
import * as OBJ_WRITER from "/obj/writer/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  SCR_BORDERSETUP(0, 0, 0, 0, 0);
  scr_battlegroup(0, 0, 0, 0, 0);
  global.mercyuse = -1;
  global.inbattle = 1;
  global.itemused = 0;
  global.flag[271] = 0;
  global.msg[4] = global.msg[0];

  if (global.actfirst === 0 && global.extraintro === 0) {
    global.myfight = 0;
    global.mnfight = 0;
    global.typer = 1;
    instance_create(global.idealborder[0], global.idealborder[2], OBJ_WRITER);
  }
  global.turn = 0;
  global.turntimer = -1;
  global.heard = 0;
  global.tmsg = "%%%";
  if (global.lv > 20) {
    global.lv = 20;
  }

  global.maxhp = 16 + global.lv * 4;

  if (global.hp > global.maxhp + 15) {
    global.hp = global.maxhp + 15;
  }

  global.at = 8 + global.lv * 2;
  global.df = 9 + ceil(global.lv / 4);

  if (global.lv === 20) {
    global.at = 30;
    global.df = 30;
    global.maxhp = 99;
  }

  alarm[0] = 3;
  let suppress_border = 0;

  if (global.screen_border_active) {
    if (
      global.battlegroup === 100 ||
      global.battlegroup === 101 ||
      global.battlegroup === 255 ||
      global.battlegroup === 256
    ) {
      suppress_border = 1;
      scr_enable_screen_border(0);
    }
  }

  const self = {
    name: "battlecontroller", // sprite name
    depth: -450, // object depth
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
    runaway: 0,
    won: 0,
    tempat: global.at,
    tempdf: global.df,
    tempdspd: global.sp,
    active: 0,
    drawrect: 1,
    drawbinfo: 1,
    rearrange: 0,
    suppress_border: suppress_border,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateIndex,
    updateSpeed,
    updateSprite,
    updateCol,
    followPath,
    createContext,
    alarm0,
    beginStep,
    step,
    user0,
    roomEnd,
    updateKeyboard,
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
  //let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_solidobject, false, false);
  //if (other) {
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
}

function alarm0() {
  this.active = 1;
}

function beginStep() {
  if (control_check(0) == 1) {
    this.user0();
  }
}

function step() {
  const lborder = instance_find(obj_lborder, 0);
  SCR_BORDERSETUP(0, 0, 0, 0, 0);
  this.currentplace = global.bmenuno;

  if (global.monster[0] === 0) {
    if (global.monster[1] === 0) {
      if (global.monster[2] === 0) {
        if (this.won === 0) {
          this.won = 1;
          global.xp += global.xpreward[3];
          global.gold += global.goldreward[3];
          this.tlvl = global.lv;
          script_execute.call(this, scr_levelup);

          if (global.flag[15] === 0) {
            caster_stop(global.batmusic);
            caster_free(global.batmusic);
          }

          global.msg[0] = scr_gettext(
            "obj_battlecontroller_286",
            string(global.xpreward[3]),
            string(global.goldreward[3])
          );

          if (this.tlvl !== global.lv) {
            global.msg[0] += scr_gettext("obj_battlecontroller_287");
            snd_play(snd_levelup);
          }

          global.msg[0] += "/%";

          if (global.extraintro === 2) {
            global.typer = 5;
            caster_free(global.currentsong);
            audio_stop_sound(mus_battle1);
            global.currentsong = caster_load(mus_toomuch);
            caster_loop(global.currentsong, 1, 1);
            global.flag[221] = 1;
            global.msg[0] = global.msg[2];
            global.myfight = 0;
            global.mnfight = 2;
            instance_find(obj_heart, 0).x = -200;
          }

          global.msc = 0;
          this.writer = instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_WRITER
          );
          this.writer.writingxend += 20;
          return;
        }
      }
    }
  }

  global.inv = 30;

  if (global.armor == 44) global.inv += 30;

  if (global.armor == 64) global.inv += 15;

  if (global.weapon == 45) global.inv += 15;

  if (global.inv < 15) global.inv = 15;

  if (global.armor == 46 || global.armor == 64) {
    if (global.mnfight == 0 && global.myfight == 0) {
      if ((global.turn + 1) % 2 == 0) {
        if (this.healed == 0) {
          this.healed = 1;

          if (global.hp < global.maxhp) global.hp += 1;

          snd_play(snd_power);
        }
      }
    } else {
      this.healed = 0;
    }
  }

  if (global.mnfight === 0 && global.myfight === 0) {
    global.typer = 1;

    if (this.active === 1) {
      if (control_check_pressed(0)) {
        if (global.bmenuno === 0) {
          global.tmsg = global.msg[0];
          global.talked = -1;
          global.bmenucoord[2] = 0;
          global.bmenuno = global.bmenucoord[0] + 1;

          if (instance_exists(obj_talkbt)) {
            if (instance_find(obj_talkbt, 0).spec === 1) {
              if (global.bmenuno === 2) {
                global.rmsg = global.msg[0];
                global.mytarget = 0;

                _with(OBJ_WRITER, function () {
                  this.halt = 3;
                });

                _with(OBJ_INSTAWRITER, function () {
                  this.halt = 3;
                });

                global.bmenuno = 10;
                global.msc = 1000 + global.monstertype[global.mytarget];
                instance_create(
                  global.idealborder[0],
                  global.idealborder[2],
                  OBJ_INSTAWRITER
                );
                control_clear(0);
                SCR_TEXT(global.msc);
              }
            }
          }

          if (
            global.bmenuno === 1 ||
            global.bmenuno === 2 ||
            global.bmenuno === 11
          ) {
            global.msc = 3;

            if (global.monster[global.bmenucoord[1]] === 0) {
              global.bmenucoord[1] += 1;
            }

            if (global.monster[global.bmenucoord[1]] === 0) {
              global.bmenucoord[1] += 1;
            }

            if (global.monster[0] == 0 && global.monster[2] == 0) {
              global.bmenucoord[1] = 1;
            }

            if (global.bmenucoord[1] > 2) {
              global.bmenucoord[1] = 0;

              if (global.monster[0] == 0) global.bmenucoord[1] = 1;

              if (global.monster[1] == 0) global.bmenucoord[1] = 2;

              if (global.monster[2] == 0) global.bmenucoord[1] = 0;
            }
          }

          if (global.bmenuno === 3) {
            if (global.item[0] !== 0) {
              global.bmenucoord[3] = 0;
              script_execute.call(this, scr_itemnameb);

              let pad = " ";

              for (let i = 0; i < 8; i++) {
                let len = 9;

                if (i % 2 === 0) {
                  len = 10;
                }

                do {
                  global.itemnameb[i] += pad;
                } while (string_length(global.itemnameb[i]) < len);
              }
            } else {
              global.bmenuno = 0;
            }
          }

          if (global.bmenuno === 4) {
            global.msc = 7;
          }

          snd_play(snd_select);

          _with(OBJ_WRITER, function () {
            this.halt = 3;
          });

          _with(OBJ_INSTAWRITER, function () {
            this.halt = 3;
          });

          instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_INSTAWRITER
          );
          control_clear(0);
          return;
        }

        if (global.bmenuno === 1) {
          global.mytarget = global.bmenucoord[1];
          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          global.myfight = 1;
          instance_find(obj_heart, 0).x = -200;
          snd_play(snd_select);
          script_execute.call(this, scr_attack);
          control_clear(0);
        }

        if (global.bmenuno === 10) {
          global.talked = global.bmenucoord[2];
          global.mntrg = global.monsterinstance[global.mytarget];

          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          snd_play(snd_select);

          _with(global.mntrg, function () {
            this.whatiheard = global.talked;
          });

          global.myfight = 2;
          instance_find(obj_heart, 0).x = -200;
          control_clear(0);
        }

        if (global.bmenuno === 2) {
          global.mytarget = global.bmenucoord[1];
          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          global.bmenuno = 10;
          global.msc = 1000 + global.monstertype[global.mytarget];
          instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_INSTAWRITER
          );
          control_clear(0);
          SCR_TEXT(global.msc);

          if (global.choices[global.bmenucoord[2]] === 0) {
            global.bmenucoord[2] = 0;
          }
        }

        if (global.bmenuno >= 3 && global.bmenuno < 4) {
          if (!global.right && !global.left) {
            instance_find(OBJ_WRITER, 0).halt = 3;
            this.itempos = global.bmenucoord[3] + (global.bmenuno - 3) * 8;
            this.thisitemid = global.item[this.itempos];
            script_execute.call(
              this,
              scr_itemuseb,
              this.itempos,
              this.thisitemid
            );
            global.talked = 91;
            global.myfight = 4;
            instance_find(obj_heart, 0).x = -200;
            snd_play(snd_select);
          }
          control_clear(0);
        }

        if (global.bmenuno === 4) {
          instance_find(OBJ_WRITER, 0).halt = 3;
          global.mercyuse = global.bmenucoord[4];

          if (global.mercyuse === 1) {
            script_execute.call(this, scr_runaway);
            global.talked = 90;
          }

          if (this.runaway === 0) {
            snd_play(snd_select);
          }

          global.myfight = 4;
          instance_find(obj_heart, 0).x = -200;
          control_clear(0);
        }
      }
    }

    if (this.active === 1) {
      if (control_check_pressed(1)) {
        if (global.bmenuno !== 0 && global.bmenuno < 6) {
          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          global.bmenuno = 0;
          global.typer = 1;
          global.msg[0] = global.tmsg;
          global.msc = 0;
          instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_WRITER
          );
          control_clear(1);
        }

        if (global.bmenuno === 10) {
          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          global.bmenuno = 2;
          global.typer = 1;
          global.msc = 3;

          if (instance_exists(obj_talkbt)) {
            if (instance_find(obj_talkbt, 0).spec === 1) {
              global.bmenuno = 0;
              global.typer = 1;
              global.msg[0] = global.rmsg;
              global.msc = 0;
            }
          }

          instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_INSTAWRITER
          );
          control_clear(1);
        }

        if (global.bmenuno === 10) {
          instance_find(OBJ_WRITER, 0).halt = 3;
          instance_find(OBJ_INSTAWRITER, 0).halt = 3;
          global.bmenuno = 3;
          global.typer = 1;
          global.msc = 0;
          instance_create(
            global.idealborder[0],
            global.idealborder[2],
            OBJ_INSTAWRITER
          );
          control_clear(1);
        }
      }
    }

    if (global.bmenuno === 1 || global.bmenuno === 2 || global.bmenuno === 11) {
      instance_find(obj_heart, 0).x = global.idealborder[0] + 32;
      instance_find(obj_heart, 0).y = scr_battlemenu_cursor_y.call(
        this,
        global.bmenucoord[1]
      );
    }

    if (global.bmenuno === 10) {
      if (global.bmenucoord[2] <= 2) {
        instance_find(obj_heart, 0).x = global.idealborder[0] + 32;
        instance_find(obj_heart, 0).y = scr_battlemenu_cursor_y.call(
          this,
          global.bmenucoord[2]
        );
      } else {
        instance_find(obj_heart, 0).x = global.idealborder[0] + 292;
        instance_find(obj_heart, 0).y = scr_battlemenu_cursor_y.call(
          this,
          global.bmenucoord[2] - 3
        );
      }
    }

    if (global.bmenuno >= 3 && global.bmenuno < 4) {
      if (global.bmenucoord[3] <= 1) {
        instance_find(obj_heart, 0).y = global.idealborder[2] + 28;
      } else {
        instance_find(obj_heart, 0).y = global.idealborder[2] + 60;
      }

      if (global.bmenucoord[3] === 0 || global.bmenucoord[3] === 2) {
        instance_find(obj_heart, 0).x = global.idealborder[0] + 32;
      } else {
        instance_find(obj_heart, 0).x = global.idealborder[0] + 280;
      }
    }

    if (global.bmenuno === 4) {
      instance_find(obj_heart, 0).x = global.idealborder[0] + 32;
      instance_find(obj_heart, 0).y = scr_battlemenu_cursor_y.call(
        this,
        global.bmenucoord[4]
      );
    }
  }

  if (this.active === 1) {
    if (control_check_pressed(1)) {
      if (global.mnfight === 0 && global.flag[21] === 0) {
        if (instance_number(OBJ_WRITER) > 0) {
          instance_find(OBJ_WRITER, 0).stringpos = string_length(
            instance_find(OBJ_WRITER, 0).originalstring
          );
        }

        control_clear(1);
      }
    }
  }

  if (global.myfight === 1 || global.myfight === 2 || global.myfight === 3) {
    instance_find(obj_heart, 0).x = -400;
  }

  if (global.mnfight === 3) {
    global.border = 0;
    script_execute.call(this, SCR_BORDERSETUP);
    if (lborder.x === global.idealborder[0]) {
      global.typer = 1;
      global.msc = 0;
      instance_create(global.idealborder[0], global.idealborder[2], OBJ_WRITER);
      global.bmenuno = 0;
      global.myfight = 0;
      global.mnfight = 0;
      global.turn += 1;
      global.mercyuse = -1;
    }
  }

  if (global.myfight === 3) {
    if (instance_exists(OBJ_WRITER)) {
      if (instance_find(OBJ_WRITER, 0).halt > 0) {
        instance_find(obj_heart, 0).x =
          global.idealborder[0] + 32 + global.bmenucoord[6] * 252;
        instance_find(obj_heart, 0).y = global.idealborder[2] + 92;

        if (control_check_pressed(0)) {
          global.heard = 0;
          global.talked = 6 + global.bmenucoord[6];

          _with(global.monsterinstance[global.mytarget], function () {
            this.whatiheard = global.talked;
          });

          instance_find(obj_heart, 0).x = -200;
          instance_find(OBJ_WRITER, 0).halt = 3;
          global.myfight = 2;
        }
      }
    }
  }

  if (global.myfight === 4) {
    if (this.runaway === 0) {
      instance_find(obj_heart, 0).x = -200;

      if (!instance_exists(OBJ_WRITER)) {
        global.myfight = 0;
        global.mnfight = 1;
        control_clear(0);
      }
    }
  }

  if (global.hp <= 0) {
    script_execute.call(this, scr_gameoverb);
  }

  if (this.currentplace < global.bmenuno) {
    if (!snd_isplaying(snd_select)) {
      snd_play(snd_select);
    }
  }
}

function user0() {
  if (this.won === 1) {
    if (!instance_exists(OBJ_WRITER)) {
      room_goto(global.currentroom);
    } else if (instance_exists(OBJ_WRITER)) {
      if (instance_find(OBJ_WRITER, 0).halt !== 0) {
        room_goto(global.currentroom);
      }
    }
  }
}

function roomEnd() {
  global.at = 8 + global.lv * 2;
  global.df = 9 + ceil(global.lv / 4);
  global.sp = this.tempspd;
  global.flag[78] = 0;
}

function updateKeyboard() {
  if (keyboard_check_pressed(vk_down)) {
    if (global.mnfight === 0) {
      if (
        global.bmenuno === 1 ||
        global.bmenuno === 2 ||
        global.bmenuno === 11
      ) {
        let oldcoord = global.bmenucoord[1];
        global.bmenucoord[1] += 1;

        if (global.bmenucoord[1] > 2) global.bmenucoord[1] = 0;

        if (global.monster[0] == 0 && global.monster[2] == 0)
          global.bmenucoord[1] = 1;

        if (global.bmenucoord[1] == 0 && global.monster[0] == 0)
          global.bmenucoord[1] = 1;

        if (global.bmenucoord[1] == 1 && global.monster[1] == 0)
          global.bmenucoord[1] = 2;

        if (global.bmenucoord[1] == 2 && global.monster[2] == 0)
          global.bmenucoord[1] = 0;

        if (global.bmenucoord[1] !== oldcoord) snd_play(snd_squeak);
      }

      if (global.bmenuno === 10) {
        let oldcoord = global.bmenucoord[2];
        if (global.bmenucoord[2] != 2 && global.bmenucoord[2] != 5)
          global.bmenucoord[2] += 1;
        else global.bmenucoord[2] -= 2;

        if (
          global.choices[global.bmenucoord[2]] == 0 &&
          global.bmenucoord[2] > 2
        )
          global.bmenucoord[2] = 3;

        if (
          global.choices[global.bmenucoord[2]] == 0 &&
          global.bmenucoord[2] <= 2
        )
          global.bmenucoord[2] = 0;

        if (
          global.choices[0] == 1 &&
          global.choices[1] == 0 &&
          global.choices[2] == 0 &&
          global.choices[3] == 0 &&
          global.choices[4] == 0 &&
          global.choices[5] == 0
        )
          global.bmenucoord[2] = 0;

        if (global.bmenucoord[2] !== oldcoord) snd_play(snd_squeak);
      }

      if (global.bmenuno >= 3 && global.bmenuno < 4) {
        let tempcheck = global.bmenucoord[3] + (global.bmenuno - 3) * 8;
        let mv = 0;

        if (global.bmenucoord[3] == 2 || global.bmenucoord[3] == 3) {
          global.bmenucoord[3] -= 2;
          mv = 1;
        }

        if (mv == 0) {
          if (global.bmenucoord[3] == 0 || global.bmenucoord[3] == 1) {
            global.bmenucoord[3] += 2;

            if (global.item[tempcheck + 2] == 0) global.bmenucoord[3] -= 2;

            mv = 1;
          }
        }

        if (mv != 0) snd_play(snd_squeak);
      }
      if (global.bmenuno == 4) {
        let oldcoord = global.bmenucoord[4];

        if (global.bmenucoord[4] == 0 && global.mercy < 1)
          global.bmenucoord[4] = 1;
        else global.bmenucoord[4] = 0;

        if (global.bmenucoord[4] != oldcoord) snd_play(snd_squeak);
      }
    }
  }

  if (keyboard_check_pressed(vk_right)) {
    if (global.mnfight == 0) {
      if (global.bmenuno == 0) {
        var oldcoord = global.bmenucoord[0];
        global.bmenucoord[0] += 1;

        if (global.bmenucoord[0] > 3) global.bmenucoord[0] = 0;

        if (global.mercy == 2 && global.bmenucoord[0] == 3)
          global.bmenucoord[0] = 0;

        if (global.mercy == 3) global.bmenucoord[0] = 1;

        if (global.bmenucoord[0] != oldcoord) snd_play(snd_squeak);
      }

      if (global.bmenuno == 10) {
        var oldcoord = global.bmenucoord[2];

        if (global.bmenucoord[2] <= 2) global.bmenucoord[2] += 3;
        else global.bmenucoord[2] -= 3;

        if (global.choices[global.bmenucoord[2]] == 0)
          global.bmenucoord[2] -= 1;

        if (
          global.choices[0] == 1 &&
          global.choices[1] == 0 &&
          global.choices[2] == 0 &&
          global.choices[3] == 0 &&
          global.choices[4] == 0 &&
          global.choices[5] == 0
        )
          global.bmenucoord[2] = 0;

        if (global.bmenucoord[2] != oldcoord) snd_play(snd_squeak);
      }

      if (global.bmenuno == 6) {
        if (global.bmenucoord[6] == 0) global.bmenucoord[6] += 1;
        else global.bmenucoord[6] -= 1;

        snd_play(snd_squeak);
      }

      if (global.myfight != 4) {
        var mv = 0;

        if (global.bmenuno == 3) {
          var tempcheck = global.bmenuno;

          if (global.bmenucoord[3] == 0) {
            if (global.item[1] != 0) global.bmenucoord[3] = 1;

            mv = 1;
          }

          if (mv == 0) {
            if (global.bmenucoord[3] == 1) {
              if (global.item[4] != 0) {
                global.bmenucoord[3] = 0;
                global.bmenuno = 3.5;
              } else {
                global.bmenucoord[3] = 0;
              }

              mv = 1;
            }
          }

          if (global.bmenucoord[3] == 2) {
            if (global.item[3] != 0) global.bmenucoord[3] = 3;

            mv = 1;
          }

          if (mv == 0) {
            if (global.bmenucoord[3] == 3) {
              if (global.item[6] != 0) {
                global.bmenucoord[3] = 2;
                global.bmenuno = 3.5;
              } else {
                global.bmenucoord[3] = 2;
              }

              mv = 1;
            }
          }

          if (mv == 1) snd_play(snd_squeak);

          if (global.bmenuno != tempcheck)
            script_execute.call(this, scr_itemrewrite);
        }

        if (mv == 0 && global.bmenuno == 3.5) {
          var tempcheck = global.bmenuno;

          if (global.bmenucoord[3] == 1) {
            global.bmenucoord[3] = 0;
            global.bmenuno = 3;
            mv = 1;
          }

          if (mv == 0) {
            if (global.bmenucoord[3] == 0) {
              if (global.item[5] != 0) {
                global.bmenucoord[3] = 1;
              } else {
                global.bmenucoord[3] = 0;
                global.bmenuno = 3;
              }

              mv = 1;
            }
          }

          if (mv == 0) {
            if (global.bmenucoord[3] == 3) {
              global.bmenucoord[3] = 2;
              global.bmenuno = 3;
              mv = 1;
            }
          }

          if (mv == 0) {
            if (global.bmenucoord[3] == 2) {
              if (global.item[7] != 0) {
                global.bmenucoord[3] = 3;
              } else {
                global.bmenucoord[3] = 2;
                global.bmenuno = 3;
              }

              mv = 1;
            }
          }

          if (mv == 1) snd_play(snd_squeak);

          if (global.bmenuno != tempcheck)
            script_execute.call(this, scr_itemrewrite);
        }
      }
    }
  }

  if (keyboard_check_pressed(vk_up)) {
    if (!keyboard_check_pressed(vk_down)) {
      if (global.mnfight == 0) {
        if (
          global.bmenuno == 1 ||
          global.bmenuno == 2 ||
          global.bmenuno == 11
        ) {
          var oldcoord = global.bmenucoord[1];
          global.bmenucoord[1] -= 1;

          if (global.bmenucoord[1] < 0) global.bmenucoord[1] = 2;

          if (global.monster[0] == 0 && global.monster[2] == 0)
            global.bmenucoord[1] = 1;

          if (global.bmenucoord[1] == 2 && global.monster[2] == 0)
            global.bmenucoord[1] = 1;

          if (global.bmenucoord[1] == 1 && global.monster[1] == 0)
            global.bmenucoord[1] = 0;

          if (global.bmenucoord[1] == 0 && global.monster[0] == 0)
            global.bmenucoord[1] = 2;

          if (global.bmenucoord[1] != oldcoord) snd_play(snd_squeak);
        }

        if (global.bmenuno == 10) {
          var oldcoord = global.bmenucoord[2];

          if (global.bmenucoord[2] != 0 && global.bmenucoord[2] != 3)
            global.bmenucoord[2] -= 1;
          else global.bmenucoord[2] += 2;

          if (global.choices[global.bmenucoord[2]] == 0)
            global.bmenucoord[2] -= 1;

          if (global.choices[global.bmenucoord[2]] == 0)
            global.bmenucoord[2] -= 1;

          if (
            global.choices[0] == 1 &&
            global.choices[1] == 0 &&
            global.choices[2] == 0 &&
            global.choices[3] == 0 &&
            global.choices[4] == 0 &&
            global.choices[5] == 0
          )
            global.bmenucoord[2] = 0;

          if (global.bmenucoord[2] != oldcoord) snd_play(snd_squeak);
        }

        if (global.bmenuno >= 3 && global.bmenuno < 4) {
          var tempcheck = global.bmenucoord[3] + (global.bmenuno - 3) * 8;

          if (global.language == "ja") {
            if (tempcheck > 0) {
              if (global.bmenucoord[3] > 0) global.bmenucoord[3] -= 1;
              else global.bmenuno -= 0.125;

              snd_play(snd_squeak);
            }
          } else {
            var mv = 0;
            tempcheck = global.bmenucoord[3];

            if (global.bmenuno == 3.5) tempcheck += 4;

            if (global.bmenucoord[3] == 2 || global.bmenucoord[3] == 3) {
              global.bmenucoord[3] -= 2;
              mv = 1;
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 0 || global.bmenucoord[3] == 1) {
                global.bmenucoord[3] += 2;

                if (global.item[tempcheck + 2] == 0) global.bmenucoord[3] -= 2;

                mv = 1;
              }
            }

            if (mv != 0) snd_play(snd_squeak);
          }
        }

        if (global.bmenuno == 4) {
          var oldcoord = global.bmenucoord[4];

          if (global.bmenucoord[4] == 0 && global.mercy < 1)
            global.bmenucoord[4] = 1;
          else global.bmenucoord[4] = 0;

          if (global.bmenucoord[4] != oldcoord) snd_play(snd_squeak);
        }
      }
    }
  }

  if (keyboard_check_pressed(vk_left)) {
    if (!keyboard_check_pressed(vk_right)) {
      if (global.mnfight == 0) {
        if (global.bmenuno == 0) {
          var oldcoord = global.bmenucoord[0];
          global.bmenucoord[0] -= 1;

          if (global.bmenucoord[0] < 0) global.bmenucoord[0] = 3;

          if (global.mercy == 2 && global.bmenucoord[0] == 3)
            global.bmenucoord[0] = 2;

          if (global.mercy == 3) global.bmenucoord[0] = 1;

          if (global.bmenucoord[0] != oldcoord) snd_play(snd_squeak);
        }

        if (global.bmenuno == 10) {
          var oldcoord = global.bmenucoord[2];

          if (global.bmenucoord[2] <= 2) global.bmenucoord[2] += 3;
          else global.bmenucoord[2] -= 3;

          if (global.choices[global.bmenucoord[2]] == 0)
            global.bmenucoord[2] -= 1;

          if (
            global.choices[0] == 1 &&
            global.choices[1] == 0 &&
            global.choices[2] == 0 &&
            global.choices[3] == 0 &&
            global.choices[4] == 0 &&
            global.choices[5] == 0
          )
            global.bmenucoord[2] = 0;

          if (global.bmenucoord[2] != oldcoord) snd_play(snd_squeak);
        }

        if (global.bmenuno == 6) {
          if (global.bmenucoord[6] == 0) global.bmenucoord[6] += 1;
          else global.bmenucoord[6] -= 1;

          snd_play(snd_squeak);
        }

        if (global.myfight != 4) {
          var mv = 0;

          if (global.bmenuno == 3) {
            var tempcheck = global.bmenuno;

            if (global.bmenucoord[3] == 0) {
              if (global.item[1] != 0) global.bmenucoord[3] = 1;

              mv = 1;
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 1) {
                if (global.item[4] != 0) {
                  global.bmenucoord[3] = 0;
                  global.bmenuno = 3.5;
                } else {
                  global.bmenucoord[3] = 0;
                }

                mv = 1;
              }
            }

            if (global.bmenucoord[3] == 2) {
              if (global.item[3] != 0) global.bmenucoord[3] = 3;

              mv = 1;
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 3) {
                if (global.item[6] != 0) {
                  global.bmenucoord[3] = 2;
                  global.bmenuno = 3.5;
                } else {
                  global.bmenucoord[3] = 2;
                }

                mv = 1;
              }
            }

            if (mv == 1) snd_play(snd_squeak);

            if (global.bmenuno != tempcheck)
              script_execute.call(this, scr_itemrewrite);
          }

          if (mv == 0 && global.bmenuno == 3.5) {
            var tempcheck = global.bmenuno;

            if (global.bmenucoord[3] == 1) {
              global.bmenucoord[3] = 0;
              global.bmenuno = 3;
              mv = 1;
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 0) {
                if (global.item[5] != 0) {
                  global.bmenucoord[3] = 1;
                } else {
                  global.bmenucoord[3] = 0;
                  global.bmenuno = 3;
                }

                mv = 1;
              }
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 3) {
                global.bmenucoord[3] = 2;
                global.bmenuno = 3;
                mv = 1;
              }
            }

            if (mv == 0) {
              if (global.bmenucoord[3] == 2) {
                if (global.item[7] != 0) {
                  global.bmenucoord[3] = 3;
                } else {
                  global.bmenucoord[3] = 2;
                  global.bmenuno = 3;
                }

                mv = 1;
              }
            }

            if (mv == 1) snd_play(snd_squeak);

            if (global.bmenuno != tempcheck)
              script_execute.call(this, scr_itemrewrite);
          }
        }
      }
    }
  }
}

function draw() {
  const uborder = instance_find(obj_uborder, 0);
  const rborder = instance_find(obj_rborder, 0);
  const dborder = instance_find(obj_dborder, 0);

  if (global.turntimer > 0) {
    this.depth = -1000;
    draw_set_color(c_red);
    global.turntimer -= 1;
  }

  if (instance_exists(obj_uborder)) {
    this.depth = 5;
    draw_set_color(c_black);

    if (this.drawrect === 1) {
      ossafe_fill_rectangle(uborder.x + 5, uborder.y + 5, rborder.x, dborder.y);
    }
  }

  if ("background_color" !== c_white && this.drawbinfo === 1) {
    script_execute.call(this, scr_binfowrite);
  }

  if (global.bmenuno === 1 && global.myfight === 0 && global.mnfight === 0) {
    let maxwidth = 0;
    let width;

    for (let i = 0; i < 3; i++) {
      let name = global.monstername[i];
      if (global.monstername[i] === 1) {
        for (let j = 1; j <= strlen(name); j++) {
          let ch = ord(string_char_at(name, j));

          if (ch === 32 || ch >= 65377) {
            width += 13;
          } else if (ch < 8192) {
            width += 16;
          } else {
            width += 26;
          }
        }
      } else {
        width = strlen(name) * 16;
      }

      if (width > maxwidth) {
        maxwidth = width;
      }
    }

    let xwrite = 190 + maxwidth;

    for (let i = 0; i < 3; i++) {
      if (global.monster[i] === 1 && !instance_exists("obj_sansb")) {
        draw_set_color(c_red);
        let lineheight = 32;
        let y_start = 280;

        draw_rectangle(
          xwrite,
          y_start + i * lineheight,
          xwrite + 100,
          y_start + i * lineheight + 16,
          false
        );
        draw_set_color(c_lime);
        draw_rectangle(
          xwrite,
          y_start + i * lineheight,
          xwrite + (global.monsterhp[i] / global.monstermaxhp[i]) * 100,
          y_start + i * lineheight + 16,
          false
        );
      }
    }
  }
}

export {
  create,
  updateAlarms,
  updateIndex,
  updateSpeed,
  updateSprite,
  followPath,
  updateCol,
  parent,
  createContext,
  alarm0,
  beginStep,
  step,
  user0,
  roomEnd,
  updateKeyboard,
  draw,
};
