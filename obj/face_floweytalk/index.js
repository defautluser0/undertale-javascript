import {
  draw_sprite_ext,
  instance_exists,
  instances,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as parent from "/obj/floface/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as OBJ_WRITER from "/obj/writer/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "face_floweytalk", // sprite name
    depth: -555, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.25, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_index: "spr_floweynice", // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
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

function roomStart() {
  parent.parent.create.call(this);
  this.image_speed = 0.25;

  if (global.faceemotion === 0 && this.sprite_index !== "spr_floweynice") {
    this.sprite_index = "spr_floweynice";
  }
  if (
    global.faceemotion === 1 &&
    this.sprite_index !== "spr_floweynicesideum"
  ) {
    this.sprite_index = "spr_floweynicesideum";
  }
  if (global.faceemotion === 2 && this.sprite_index !== "spr_floweysassy") {
    this.sprite_index = "spr_floweysassy";
  }
  if (global.faceemotion === 3 && this.sprite_index !== "spr_floweypissed") {
    this.sprite_index = "spr_floweypissed";
  }
  if (global.faceemotion === 4 && this.sprite_index !== "spr_floweyevil") {
    this.sprite_index = "spr_floweyevil";
  }
  if (global.faceemotion === 5 && this.sprite_index !== "spr_floweygrin") {
    this.sprite_index = "spr_floweygrin";
  }
}

function step() {
  if (global.faceemotion == 0 && this.sprite_index != "spr_floweynice")
    this.sprite_index = "spr_floweynice";

  if (global.faceemotion == 1 && this.sprite_index != "spr_floweynicesideum")
    this.sprite_index = "spr_floweynicesideum";

  if (global.faceemotion == 2 && this.sprite_index != "spr_floweysassy")
    this.sprite_index = "spr_floweysassy";

  if (global.faceemotion == 3 && this.sprite_index != "spr_floweypissed")
    this.sprite_index = "spr_floweypissed";

  if (global.faceemotion == 4 && this.sprite_index != "spr_floweyevil")
    this.sprite_index = "spr_floweyevil";

  if (global.faceemotion == 5 && this.sprite_index != "spr_floweygrin")
    this.sprite_index = "spr_floweygrin";

  if (global.currentroom == "room_ruinsexit") {
    if (global.faceemotion == 6 && this.sprite_index != "spr_floweygrin")
      this.sprite_index = "spr_floweytoriel";

    if (global.faceemotion == 7 && this.sprite_index != "spr_floweygrin")
      this.sprite_index = "spr_floweytoriel2";

    if (global.faceemotion == 8 && this.sprite_index != "spr_floweygrin")
      this.sprite_index = "spr_floweyplain";
  }

  if (instance_exists(OBJ_WRITER)) {
    if (instances.get(OBJ_WRITER)[0].halt !== 0) {
      this.image_speed = 0;
      this.image_index = 0;
    } else {
      this.image_speed = 0.2;
    }
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  step,
};
