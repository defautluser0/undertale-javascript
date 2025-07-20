import { draw_sprite_ext, getBoundingBox, instance_destroy, collision_rectangle } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";

import * as obj_fakeheart from "/obj/fakeheart/index.js"

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  alarm[0] = 90;

  return {
    name: "guidearrows", // sprite name
    depth: -4000, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_guidearrows", // sprite object
    visible: false, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    updateCol,
    alarm1,
    alarm0,
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

  getBoundingBox.call(this)

  this.updateCol()
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
  this.visible = true;
  this.alarm[0] = 40;
}

function alarm0() {
  this.visible = false;
  this.alarm[1] = 8;
}

function updateCol() {
  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_fakeheart, true, false)
  if (other) {
    instance_destroy(this);
  }
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, alarm1, alarm0 };
