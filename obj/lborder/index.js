import {
  abs,
  draw_sprite_ext,
  getBoundingBox,
  instances,
  round,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as parent from "/obj/borderparent/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_uborder from "/obj/uborder/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "lborder", // sprite name
    depth: -999, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_border", // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    endStep,
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
  parent.create.call(this);
  this.x = global.idealborder[0];
  this.y = global.idealborder[3];
  this.image_yscale = -27;
  this.instant = 0;
}

function endStep() {
  const dborder = instances.get(obj_dborder)[0];
  const uborder = instances.get(obj_uborder)[0];
  if (this.x != global.idealborder[0]) {
    if (abs(this.x - global.idealborder[0]) <= 15)
      this.x = global.idealborder[0];
    else if (this.x > global.idealborder[0]) this.x -= 15;
    else this.x += 15;
  }

  if (this.y != global.idealborder[3]) {
    if (abs(this.y - global.idealborder[3]) <= 15) {
      this.y = global.idealborder[3];
    } else {
      if (this.y > global.idealborder[3]) this.y -= 15;
      else this.y += 15;

      if (
        uborder.y > global.idealborder[2] &&
        dborder.y > global.idealborder[3]
      )
        this.y -= 15;

      if (
        uborder.y < global.idealborder[2] &&
        dborder.y < global.idealborder[3]
      )
        this.y += 15;
    }
  }

  let size = round((global.idealborder[2] - global.idealborder[3]) / 5);

  if (
    this.x == global.idealborder[0] ||
    global.idealborder[2] > this.y + this.image_yscale * 5
  ) {
    if (this.image_yscale != size) {
      if (abs(size - this.image_yscale) <= 3) this.image_yscale = size;

      if (this.image_yscale > size) this.image_yscale -= 3;

      if (this.image_yscale < size) this.image_yscale += 3;

      if (
        uborder.y > global.idealborder[2] &&
        dborder.y > global.idealborder[3]
      )
        this.image_yscale += 3;

      if (
        uborder.y < global.idealborder[2] &&
        dborder.y < global.idealborder[3]
      )
        this.image_yscale -= 3;
    }
  }

  this.y = dborder.y;
  this.image_yscale = (uborder.y - dborder.y) / 5;

  if (this.instaborder == 1) {
    this.x = global.idealborder[0];
    this.y = global.idealborder[2];
    this.image_yscale = (global.idealborder[3] - global.idealborder[2]) / 5;
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  endStep,
};
