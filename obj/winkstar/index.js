import { draw_sprite_ext, action_move, instance_destroy } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "winkstar", // sprite name
    depth: -200, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_winkstar", // sprite object
    visible: true, // sprite visibility
    image_angle: 0, // image angle
    direction: 0, // default direction
    hspeed: 0, // for first frame hspeed and vspeed not being NaN (undefined)
    vspeed: 0, // for first frame hspeed and vspeed not being NaN (undefined)
    speed: 0, // for first frame speed not being NaN (undefined)
    friction: 0, // for first frame friction not being NaN (undefined)
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    alarm0,
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
  
  if (this.friction !== 0) {
    if (this.speed > 0) {
      this.speed -= this.friction;
      if (this.speed < 0) this.speed = 0;
    }
  }

  const dirRad = -(this.direction * Math.PI) / 180;
  this.hspeed = Math.cos(dirRad) * this.speed;
  this.vspeed = Math.sin(dirRad) * this.speed;

	// Update position
	this.x += this.hspeed;
	this.y += this.vspeed;
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
      this.image_angle,
      c_white,
      this.image_alpha
    );
  }
}

function roomStart() {
  action_move.call(this, "000000001", 8);
  this.alarm[0] = 60;
  this.friction = 0.8;
}

function alarm0() {
  instance_destroy(this);
}

function step() {
  if (this.alarm[0] < 30) {
    this.image_alpha -= 0.1;
  }

  this.image_angle += 8;
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, roomStart, alarm0, step };
