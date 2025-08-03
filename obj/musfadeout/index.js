import {
  draw_sprite_ext,
  instance_destroy,
} from "/imports/assets/gamemakerFunctions.js";
import {
  caster_free,
  caster_get_volume,
  caster_set_volume,
  caster_stop,
} from "/imports/customFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

const parent = null;

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  const mysong = global.currentsong;

  return {
    name: "musfadeout", // sprite name
    depth: 0, // object depth
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
    mysong: mysong,
    volume: caster_get_volume(mysong),
    fadespeed: 0.1,

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
  this.volume -= this.fadespeed;

  if (this.volume < 0.05) {
    this.volume = 0;
  }

  caster_set_volume(this.mysong, this.volume);

  if (this.volume === 0) {
    caster_stop(this.mysong);
    caster_free(this.mysong);
    global.currentsong = -1;
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
