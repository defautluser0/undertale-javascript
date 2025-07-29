import {
  draw_sprite_ext,
  draw_sprite,
  instances,
  instance_create,
  instance_exists,
  instance_destroy,
  room_goto,
  _with,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white, snd_noise } from "/imports/assets.js";
import { snd_play } from "/imports/customFunctions.js";
import global from "/imports/assets/global.js";

import * as obj_tempblack from "/obj/tempblack/index.js";
import * as obj_fader from "/obj/fader/index.js";
import * as obj_mainchara from "/obj/mainchara/index.js";
import * as obj_transheart from "/obj/transheart/index.js";
import * as parent from "/obj/battler/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.interact = 3;
  alarm[2] = 40;
  alarm[4] = 1;
  let heartdraw = 0;
  let on = 0;
  let clap = 0;
  let depp = -600;
  instance_create(0, 0, obj_tempblack);

  return {
    name: "battlerflowey", // sprite name
    depth: -601, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: null, // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    heartdraw,
    on,
    clap,
    depp,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    alarm2,
    alarm3,
    alarm4,
    roomEnd,
    draw,
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

function alarm4() {
  if (this.on === 0) {
    if (this.heartdraw === 1) {
      this.heartdraw = 0;
      this.on = 1;
      this.clap += 1;
    }
  }

  if (this.on === 0) {
    if (this.heartdraw === 0) {
      snd_play(snd_noise);
      this.on = 1;
      this.heartdraw = 1;
    }
  }

  this.on = 0;

  if (this.clap > 2) {
    instance_create(
      instances.get(obj_mainchara)[0].x + 5,
      instances.get(obj_mainchara)[0].y + 17,
      obj_transheart
    );
    this.heartdraw = 0;
    instances.get(obj_mainchara)[0].depth = 100;
  } else {
    this.alarm[4] = 2;
  }
}

function alarm3() {
  instance_create(0, 0, obj_fader);

  if (
    window.location.href === "https://undertale.defautluser0.xyz/room/area1_2/"
  ) {
    room_goto("room_floweybattle");
    global.room_persistent = window.location.href;
  }

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/tundra_papdoor/"
  ) {
    room_goto("room_papdate");
  }

  if (instance_exists("obj_alabdoor_l")) {
    room_goto("room_adate");
  }
}

function alarm2() {
  this.alarm[3] = 1;
}

function roomEnd() {
  instance_destroy(this);
}

function draw() {
  let mainchara;
  if (instances.get(obj_mainchara)) {
    mainchara = instances.get(obj_mainchara)[0];
  }
  if (this.clap < 3 && mainchara) {
    mainchara.depth = this.depp;
  }
  if (instance_exists(obj_fader)) {
    _with(obj_fader, function () {
      instance_destroy(this);
    });
  }
  if (this.heartdraw === 1 && mainchara) {
    draw_sprite("spr_heartsmall", 0, mainchara.x + 5, mainchara.y + 17);
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  alarm4,
  alarm3,
  alarm2,
  roomEnd,
  draw,
};
