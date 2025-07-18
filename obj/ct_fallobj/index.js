import { draw_sprite_ext, random, choose , instance_destroy } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import roomSize from "/imports/assets/roomSize.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  return {
    name: "ct_falllobj", // sprite name
    depth: 10, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 1, // sprite frame number
		image_angle: 0, // image angle
		image_blend: c_white, // image color
    sprite_index: null, // sprite object
		gravity: 0, // object gravity
		gravity_direction: 270, // gravity direction (270 = down)
		speed: 0, // instance speed
		vspeed: 0, // vertical speed
		hspeed: 0, // horizontal speed
		direction: 0, // direction
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
	// gravity_direction in degrees, gravity magnitude
	let rad = this.gravity_direction * (Math.PI / 180);

	// Apply gravity vector to velocity components
	this.hspeed += Math.cos(rad) * this.gravity;
	this.vspeed -= Math.sin(rad) * this.gravity;

	// Update speed and direction from hspeed and vspeed
	this.speed = Math.sqrt(this.hspeed * this.hspeed + this.vspeed * this.vspeed);
	this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);

	// Update position
	this.x += this.hspeed;
	this.y += this.vspeed;
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
      this.image_angle,
      this.image_blend,
      this.image_alpha
    );
  }
}

function roomStart() {
	this.x = random(roomSize.width);
	this.gravity = 0.02;
	this.vspeed = 1;
	this.image_alpha = 0.5;
	this.rotspeed = choose(1, -1) * (2 + random(4));
	this.hspeed  = choose(1, -1) * (1 + random(1));
	this.siner = 0;
	this.sinerfactor = choose(1, -1) * random(1);
}

function step() {
	if (this.y > 250) {
		instance_destroy(this);
  }

	this.siner += 1;
	this.x += (Math.sin(this.siner / 5) * this.sinerfactor);
	this.y += (Math.sin(this.siner / 6) * this.sinerfactor);
	this.image_angle += this.rotspeed;
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, roomStart, step };
