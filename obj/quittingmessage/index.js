import {
  draw_sprite_ext,
  instance_destroy,
} from "/imports/assets/gamemakerFunctions.js";
import {
  view_current,
  view_wview,
  view_xview,
  view_yview,
} from "/imports/view.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "quittingmessage", // sprite name
    depth: -999999, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 0, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.1, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_quittingmessage", // sprite object
    visible: true, // sprite visibility

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
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

function draw() {
  const scale = view_wview[view_current] / 640;

  if (global.quit > 0) {
    draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      view_xview[view_current],
      view_yview[view_current],
      scale,
      scale,
      0,
      c_white,
      this.image_alpha
    );
  } else {
    instance_destroy(this);
  }

  if (this.image_alpha < 0.9) {
    this.image_alpha += 0.1;
  }
}

export { create, updateAlarms, updateGamemakerFunctions, draw };
