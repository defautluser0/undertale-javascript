import {
  collision_rectangle,
  draw_sprite_ext,
  getBoundingBox,
  script_execute,
} from "/imports/assets/gamemakerFunctions.js";
import { scr_gameoverb } from "/imports/customFunctions.js";
import { control_check } from "/imports/input.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_lborder from "/obj/lborder/index.js";
import * as obj_rborder from "/obj/rborder/index.js";
import * as obj_uborder from "/obj/uborder/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.sp = global.asp;

  return {
    name: "fakeheart", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 1, // sprite frame number
    image_width: 0, // placeholder
    image_height: 0, // placeholder
    sprite_index: "spr_heart", // sprite object
    visible: true, // sprite visibility
    parent: parent, // object parent

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    movement: 1,
    hgo: 0,
    vgo: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    step,
    updateCol,
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

  this.updateCol();
}

function updateSprite() {
  if (this.visible === true) {
    let img = draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      0,
      c_white,
      this.image_alpha,
      1
    );
    if (img) {
      this.sprite_width = img.width;
      this.sprite_height = img.height;
    }
  }
}

function step() {
  global.invc -= 1;
  if (global.invc > 0) {
    this.image_speed = 0.5;
  } else {
    this.image_index = 0;
    this.image_speed = 0;
  }

  if (global.left) {
    if (this.movement === 1) {
      if (control_check(1) === true) {
        this.x -= global.sp / 2;
      } else {
        this.x -= global.sp;
      }
    }
  }
  if (global.right) {
    if (this.movement === 1) {
      if (control_check(1) === true) {
        this.x += global.sp / 2;
      } else {
        this.x += global.sp;
      }
    }
  }
  if (global.up) {
    if (this.movement === 1) {
      if (control_check(1) === true) {
        this.y -= global.sp / 2;
      } else {
        this.y -= global.sp;
      }
    }
  }
  if (global.down) {
    if (this.movement === 1) {
      if (control_check(1) === true) {
        this.y += global.sp / 2;
      } else {
        this.y += global.sp;
      }
    }
  }
  if (global.hp < 1) {
    script_execute.call(this, scr_gameoverb);
  }
}

function updateCol() {
  let other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_dborder,
    false,
    false
  );
  if (other) {
    this.y = other.y - this.sprite_height;
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_rborder,
    false,
    false
  );
  if (other) {
    this.x = other.x - this.sprite_width;
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_uborder,
    false,
    false
  );
  if (other) {
    this.y = other.y + 5;
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_lborder,
    false,
    false
  );
  if (other) {
    this.x = other.x + 5;
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  step,
  updateCol,
};
