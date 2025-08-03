import { draw_sprite_ext } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import roomSize from "/imports/assets/roomSize.js";

function create() {
  return {
    name: "unfader",
    depth: -99999,
    image_xscale: roomSize.width * 2,
    image_yscale: roomSize.height,
    sprite_index: "spr_pixblk",
    image_speed: 0,
    image_index: 0,
    image_number: 1,
    image_alpha: 0,
    x: 0,
    y: 0,
    tspeed: 0.08,
    over: 0,

    step,
    updateGamemakerFunctions,
    updateSprite,
  };
}

function updateGamemakerFunctions() {
  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }
}

function updateSprite() {
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

function step() {
  this.image_alpha += this.tspeed;
}

export { create, step, updateGamemakerFunctions, updateSprite };
