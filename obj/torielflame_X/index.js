import { draw_sprite_ext, getBoundingBox, collision_rectangle, instance_create, instance_destroy, draw_rectangle, _with } from "/imports/assets/gamemakerFunctions.js";
import { c_white, snd_ehurt1 } from "/imports/assets.js";
import { snd_play } from "/imports/customFunctions.js";
import global from "/imports/assets/global.js";

import * as obj_floweybattle1 from "/obj/floweybattle1/index.js";
import * as obj_shaker from "/obj/shaker/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  alarm[0] = 70;
  alarm[1] = 100;

  return {
    name: "torielflame_X", // sprite name
    depth: -10, // object depth
    image_xscale: 2, // sprite scale
    image_yscale: 2, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 4, // sprite frame number
    sprite_index: "spr_torielflame", // sprite object
    visible: false, // sprite visibility
    hspeed: 0, // hspeed default
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    flashing: 1,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    alarm1,
    alarm0,
    checkCol,
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

  this.x += this.hspeed;

  getBoundingBox.call(this);

  this.checkCol()
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

function alarm1() {
  this.hspeed = -8;
  this.flashing = 0;
  this.visible = true;
  this.image_speed = 0.25
}

function alarm0() {
  if (this.flashing === 1) {
    if (this.visible === true) {
      this.visible = false;
    } else {
      this.visible = true;
    }
    this.alarm[0] = 1;
  }
}

function checkCol() {
  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom,  obj_floweybattle1, false, false);
  if (other) {
    _with (obj_floweybattle1, function() {
      this.conversation = 17;
      this.sprite_index = "spr_floweyhurt";
    })
    snd_play(snd_ehurt1);
    global.hshake = 2;
    global.shakespeed = 2;
    global.vshake = 0;
    instance_create(0, 0, obj_shaker);
    instance_destroy(this)
  }
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, alarm1, alarm0, checkCol };
