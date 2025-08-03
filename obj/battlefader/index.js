import {
  draw_sprite_ext,
  instance_destroy,
  instance_exists,
  instances,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";

import * as obj_fakeheart from "/obj/fakeheart/index.js";
import * as obj_heart from "/obj/heart/index.js";

const parent = null;

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  let heart;
  if (instances.get(obj_heart)) {
    heart = instances.get(obj_heart)[0];
  }

  if (instance_exists(obj_fakeheart)) {
    heart = instances.get(obj_fakeheart)[0];
  }

  heart.depth = -1001;

  return {
    name: "battlefader", // sprite name
    depth: -1000, // object depth
    image_xscale: 640, // sprite scale
    image_yscale: 320, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_pixblk", // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    heart: heart,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
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

function step() {
  this.image_alpha -= 0.2;
  if (this.image_alpha < 0.1) {
    this.heart.depth = 0;
    instance_destroy(this);
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  step,
};
