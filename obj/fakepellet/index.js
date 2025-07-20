import { draw_sprite_ext, action_move, move_towards_point, instances, collision_rectangle, getBoundingBox, _with, instance_destroy } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";

import * as obj_fakeheart from "/obj/fakeheart/index.js";
import * as obj_floweybattle1 from "/obj/floweybattle1/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "fakepellet", // sprite name
    depth: -400, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.5, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_index: "spr_spinbullet", // sprite object
    visible: true, // sprite visibility
    parent: parent,
    friction: 0,
    speed: 0,
    direction: 0,
    hspeed: 0,
    vspeed: 0,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    attackyou: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    updateCol,
    alarm0,
    step,
    outsideRoom,
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

  if (this.friction !== 0) {
    if (this.speed > 0) {
      this.speed -= this.friction;
      if (this.speed < 0) this.speed = 0;
    }
  }
  getBoundingBox.call(this);

  const dirRad = -(this.direction * Math.PI) / 180;
  this.hspeed = Math.cos(dirRad) * this.speed;
  this.vspeed = Math.sin(dirRad) * this.speed;

	// Update position
	this.x += this.hspeed;
	this.y += this.vspeed;
  this.updateCol();
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
  action_move("000010000", 0);
}

function step() {
  const fakeheart = instances.get(obj_fakeheart)[0]
  if (this.attackyou === 1) {
    move_towards_point.call(this, fakeheart.xstart, fakeheart.ystart, 0.1);
    this.depth = -500;
    this.attackyou = 2;
    this.friction = -0.004
  }
}

function updateCol() {
  let other = collision_rectangle.call(this, this.bbox_left, this.bbox_top, this.bbox_right, this.bbox_bottom, obj_fakeheart, true, false);
  if (other) {
    _with(obj_floweybattle1, function() {
      this.alarm[9] = 2;
    })
    _with(this._object, function() {
      this.x = -800;
    })
  }
}

function outsideRoom() {
  _with(this._object, function() {
    instance_destroy(this);
  })
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, updateCol, parent, alarm0, step, outsideRoom };
