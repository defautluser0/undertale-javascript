import {
  draw_sprite_ext,
  instance_create,
  room_goto,
  room_next,
  room_goto_next,
  getBoundingBox,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_persistentfader from "/obj/persistentfader/index.js";
import * as obj_unfader from "/obj/unfader/index.js";
import * as parent from "/obj/doorparent/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "doorA", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_doorA", // sprite object
    visible: false, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    touched: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    alarm2,
    user9,
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

function alarm2() {
  global.entrance = 1;
  instance_create(0, 0, obj_persistentfader);

  if (global.currentroom !== "room_castle_prebarrier") {
    room_goto(room_next(global.currentroom));
  } else if (global.flag[7] === 1) {
    room_goto("room_castle_trueexit");
  } else {
    room_goto_next();
  }
}

function user9() {
  global.interact = 3;
  instance_create(0, 0, obj_unfader);

  if (this.touched === 0) {
    this.alarm[2] = 8;
    this.touched = 1;
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  alarm2,
  user9,
  parent,
};
