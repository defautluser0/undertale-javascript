import {
  draw_sprite_ext,
  instance_destroy,
  instance_exists,
  instance_create,
  getBoundingBox,
  collision_rectangle,
  instances,
  ini_open,
  ini_read_real,
  ini_write_real,
  ini_close,
  _with,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white, mus_flowey, mus_toriel } from "/imports/assets.js";
import {
  caster_load,
  caster_loop,
  scr_depth,
} from "/imports/customFunctions.js";
import global from "/imports/assets/global.js";

import * as obj_floweytalker1 from "/obj/floweytalker1/index.js";
import * as obj_mainchara from "/obj/mainchara/index.js";
import * as obj_dialoguer from "/obj/dialoguer/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";
import * as obj_fader from "/obj/fader/index.js";
import * as obj_battlerflowey from "/obj/battlerflowey/index.js";
import * as obj_toroverworld1 from "/obj/toroverworld1/index.js";
import * as obj_torface from "/obj/torface/index.js";

const parent = null;

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  ini_open("undertale.ini");
  const a = ini_read_real("Flowey", "Alter", 0);
  const b = ini_read_real("Flowey", "K", 0);
  const c = ini_read_real("Flowey", "SPECIALK", 0);
  ini_close();
  let alter = 0;

  if (a > 0 || b > 0 || c > 0) {
    alter = 1;
  }

  if (alter === 1) {
    _with(obj_floweytalker1, function () {
      this.visible = false;
    });
  }

  return {
    name: "floweytrigger", // sprite name
    depth: 0, // object depth
    image_xscale: 50, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_event", // sprite object
    visible: false, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    conversation: 0,
    faketor: 0,
    alter: alter,
    a: a,
    b: b,
    c: c,
    collided: false,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    updateCol,
    alarm4,
    alarm3,
    alarm2,
    alarm0,
    step,
  };
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

  getBoundingBox.call(this);

  this.xprevious = this.x;
  this.yprevious = this.y;
  this.previousx = this.x;
  this.previousy = this.y;

  this.updateCol();
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
  if (global.plot > 0.5) {
    instance_destroy(this);
  }

  if (this.a > 0 || this.b > 0 || this.c > 0) {
    this.alter = 1;
  }

  if (this.alter === 1) {
    instances.get(obj_floweytalker1)[0].visible = false;
  }
}

function updateCol() {
  let other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_mainchara,
    false,
    false
  );
  if (other && !this.collided && other.xprevious !== 0) {
    this.collided = true;
    if (global.plot === 0) {
      other.x = other.xprevious;
      other.y = other.yprevious;
      global.interact = 1;

      if (this.alter === 0) {
        ini_open("undertale.ini");
        this.g = ini_read_real("Flowey", "Met1", 0);
        this.truename = ini_read_real("Flowey", "truename", 0);
        this.IK = ini_read_real("Flowey", "IK", 0);
        this.NK = ini_read_real("Flowey", "NK", 0);
        global.currentsong = caster_load(mus_flowey);
        global.playing1 = 1;
        caster_loop(mus_flowey, 1, 1);
        global.typer = 9;
        global.facechoice = 2;
        global.faceemotion = 0;
        global.msc = 200;
        this.spec = 0;

        if (this.g === 1) {
          global.msc = 0;
          global.msg[0] =
            " \\W* Howdy^2!&* I'm\\Y FLOWEY\\W.^2&* \\YFLOWEY\\W the \\YFLOWER\\W!/";
          global.msg[1] = " * Hee hee hee.../";
          global.msg[2] = " * Why'd you make me&  introduce myself?/";
          global.msg[3] =
            " * It's rude to act&  like you don't&  know who I am./";
          global.msg[4] = " * Someone ought to teach&  you proper manners./";
          global.msg[5] = " * I guess little old me&  will have to do./";
          global.msg[6] = " * Ready^2?&* Here we go!/%%";
        }

        if (this.g > 1) {
          global.msc = 0;
          global.msg[0] = " * Don't you have anything&  better to do?/%%";
        }

        this.conversation = 1;

        if (this.spec === 1) {
          global.msc = 0;
          ini_write_real("Flowey", "Alter", 1);
          global.msg[0] = " * Error/%%";
          if (this.truename === 1) {
            global.msg[0] = " * Really^1, \\[C]?/";
            global.msg[1] = " \\E5* Well^1, do what you&  will./";
            global.msg[2] = " \\E4* I'll be waititng for&  you!/%%";
          }
          if (this.IK > 0) {
            global.msg[0] = " \\E0* Hey^1.&* Remember./";
            global.msg[1] = " \\E2 DON'T kill anyone./";
            global.msg[2] = " \\E2 * .../";
            global.msg[3] =
              " \\E1* I can't believe this&  is a REAL thing I&  have to remind you./";
            global.msg[4] = " \\E0* Hee hee hee.../";
            global.msg[5] = " * Good luck!/%%";
          }
          if (this.NK > 0) {
            global.msg[0] = " * Remember.../";
            global.msg[1] =
              " \\E1* THIS time^1, you've&  GOT to become friends&  with everyone./";
            global.msg[2] = " \\E2* OK?/";
            global.msg[3] =
              " \\E5* If you DON'T^1, you'll&  be miserable FOREVER./";
            global.msg[4] = " \\E1* And we wouldn't want&  THAT^1, would we?/";
            global.msg[5] =
              " \\E0* No..^1.&* We just want you&  to be happy^1, right?/";
            global.msg[6] = " * Good luck. /%%";
          }

          this.conversation = 19;
          this.alarm[4] = 5;
        }

        ini_write_real("Flowey", "Met1", this.g + 1);
        ini_close();
        if (!instance_exists(obj_dialoguer)) {
          instance_create(0, 0, obj_dialoguer);
        }
      } else {
        global.plot = 0;
        this.conversation = 23;
      }
    }
  }
}

function alarm4() {
  this.conversation += 1;
}

function alarm3() {
  global.interact = 0;
}

function alarm2() {
  instance_create(146, 260, obj_toroverworld1);
  global.msc = 201;
  global.typer = 4;
  global.interact = 1;
  global.facechoice = 1;
  this.conversation = 3;

  if (this.faketor === 1) {
    global.msc = 0;
    global.msg[0] = scr_gettext("obj_floweytrigger_122");
    global.msg[1] = scr_gettext("obj_floweytrigger_123");
    global.msg[2] = scr_gettext("obj_floweytrigger_124");
    global.msg[3] = scr_gettext("obj_floweytrigger_125");
    global.msg[4] = scr_gettext("obj_floweytrigger_126");
    global.msg[5] = scr_gettext("obj_floweytrigger_127");
    global.msg[6] = scr_gettext("obj_floweytrigger_128");
    global.msg[7] = scr_gettext("obj_floweytrigger_129");

    _with(this.temptor, function () {
      instance_destroy(this);
    });
  }

  instance_create(0, 0, obj_dialoguer);
}

function alarm0() {
  global.room_persistent = window.location.href;
  global.plot = 0;
  this.alarm[2] = 42;
  instance_create(0, 0, obj_battlerflowey);
}

function step() {
  if (this.conversation == 1 && instance_exists(OBJ_WRITER) == 0) {
    global.interact = 3;
    this.alarm[0] = 1;
    this.conversation = 2;
    instance_create(0, 0, obj_fader);
  }

  if (this.conversation == 3 && instance_exists(obj_torface))
    this.conversation = 3.5;

  if (this.conversation == 3.5 && instance_exists(obj_torface) == 0) {
    global.room_persistent = "";
    global.specialbattle = 0;
    _with(obj_toroverworld1, function () {
      this.direction = 90;
      this.speed = 2;
    });
    this.alarm[3] = 15;
    this.conversation = 4;
  }

  if (this.conversation == 20 && instance_exists(OBJ_WRITER) == 0) {
    this.mus = instance_create(0, 0, obj_musfadeout);
    global.interact = 1;
    this.visible = false;
    this.flow = obj_floweytalker1;

    _with(obj_floweytalker1, function () {
      this.visible = false;
    });

    this.flow_m = scr_marker(flow.x, flow.y, spr_floweysink);

    scr_depth.call(this.flow_m);

    this.flow_m.image_speed = 0.25;
    this.conversation = 21;
  }

  if (this.conversation == 21 && instance_exists(OBJ_WRITER) == 0) {
    if (this.flow_m.image_index >= 5) {
      this.flow_m.visible = false;
      this.conversation = 21.2;
      this.alarm[4] = 50;
    }
  }

  if (this.conversation == 22.2 && instance_exists(OBJ_WRITER) == 0) {
    global.plot = 0;

    instance_destroy(obj_npc_marker);

    instance_destroy(obj_musfadeout);

    caster_free(global.currentsong);
    this.conversation = 23;
  }

  if (this.conversation == 23) {
    this.temptor = scr_marker(146, view_yview[0] - 60, spr_toriel_d);
    this.temptor.image_speed = 0.25;
    this.temptor.vspeed = 2;
    global.currentsong = caster_load(mus_toriel);
    caster_loop(global.currentsong, 0.7, 0.86);
    global.playing1 = 1;
    this.conversation = 24;
  }

  if (this.conversation == 24) {
    scr_depth.call(this.temptor);

    if (this.temptor.y >= 258) {
      this.faketor = 1;
      this.temptor.image_index = 0;
      this.temptor.speed = 0;
      this.temptor.image_speed = 0;
      this.conversation = 25;
      this.alarm[2] = 30;
    }
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  updateCol,
  alarm4,
  alarm3,
  alarm2,
  alarm0,
  step,
};
