import {
  draw_sprite_ext,
  instance_exists,
  string_length,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_choicer from "/obj/choicer/index.js";
import * as parent from "/obj/writer/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "instawriter", // sprite name
    depth: -500, // object depth
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
    stringno: 0,
    stringpos: 0,
    halt: 0,
    dfy: 0,
    sound_enable: 1,
    originalstring: "",
    mystring: [],
    doak: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    alarm0,
    roomStart,
    parent_draw,
    draw,
    beginStep,
    parent_beginStep,
    parent_step,
    step,
    user1,
    user0,
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

function alarm0() {
  this.parent.alarm0.call(this);
}

function roomStart() {
  this.parent.roomStart.call(this);
  this.alarm[0] = -1;
  this.stringpos = string_length(this.originalstring);
}

function draw() {
  this.parent.draw.call(this);
}

function step() {
  this.parent.step.call(this);
}

function beginStep() {
  this.parent.beginStep.call(this);
}

function parent_beginStep() {
  this.parent.parent_beginStep.call(this);
}

function parent_step() {
  this.parent.parent_step.call(this);
}

function parent_draw() {
  this.parent.parent_draw.call(this);
}

function user1() {
  if (global.inbattle === 0) {
    if (!instance_exists(obj_choicer)) {
      this.choicer = instance_exists(0, 0, obj_choicer);
      this.choicer.creator = this.name;
    }
  } else {
    this.halt = 5;
  }
}

function user0() {
  this.parent.user0.call(this);
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  user1,
  step,
  draw,
  beginStep,
  parent_beginStep,
  parent_draw,
  parent_step,
  user0,
  alarm0,
};
