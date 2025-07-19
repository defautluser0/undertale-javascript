import { draw_sprite_ext, instance_create, instances } from "/imports/assets/gamemakerFunctions.js";
import { c_white, mus_flowey } from "/imports/assets.js";
import { SCR_BORDERSETUP } from "/imports/customFunctions.js"

import * as obj_fakeheart from "/obj/fakeheart/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";

import global from "/imports/assets/global.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  let floweysong = mus_flowey
  global.inbattle = 1
  global.border = 3;
  let conversation = 0;
  alarm[0] = 10;
  global.faceemotion = 0;
  SCR_BORDERSETUP(0, 0, 0, 0, 0)

  return {
    name: "floweybattle1", // sprite name
    depth: 0, // object depth
    image_xscale: 2, // sprite scale
    image_yscale: 2, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_index: "spr_floweynice", // sprite object
    sprite_width: 48,
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    floweysong,
    conversation,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
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
      this.image_alpha,
    );
  }
}

function alarm0() {
  this.blcon = instance_create(this.x + this.sprite_width, this.y, "obj_blconwdflowey");
  global.msc = 666;
  global.typer = 6;
  this.conversation = 1;
  this.image_speed = 0.2;
  instance_create(instances.get(obj_fakeheart)[0].x - 14, instances.get(obj_fakeheart)[0].y - 14, "obj_guidearrows");
  this.blconwriter = instance_create(this.blcon.x + 40, this.blcon.y + 10, OBJ_WRITER)
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, alarm0 };
