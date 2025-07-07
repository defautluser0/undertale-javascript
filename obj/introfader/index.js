import roomSize from "/imports/assets/roomSize.js";
import { spr_pixblk } from "/imports/assets.js";
import { instance_destroy, instances, draw_sprite } from "/imports/assets/gamemakerFunctions.js";
import * as obj_introimage from "/obj/introimage/index.js"

function create() {
	const alarm = new Array(12).fill(-1);
	return {
		image_xscale: roomSize.width,
		image_yscale: 70,
		x: 0,
		y: 0,
		image_alpha: 0,
		image_index: 0,
		image_speed: 0,
		sprite_index: spr_pixblk,

		tpseed: 0.1,
		over: 0,

		alarm: alarm,

		alarm3,
		alarm2,
		step,
		updateAlarms,
		updateGamemakerFunctions,
	}
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

	draw_sprite(this.sprite_index, this.image_index, this.x, this.y);
}

function alarm3() {
	this.image_alpha -= 0.1
	
	if (this.image_alpha <= 0.2) {
		instance_destroy(this);
	}

	this.alarm[3] = 2;
}

function alarm2() {
	this.alarm[3] = 2;
	
	instances.get(obj_introimage).image_index += 1;
}

function step() {
	if (this.image_alpha <= 0.9 && this.over === 0) {
		this.image_alpha += this.tspeed;
	}
	if (this.image_alpha > 0.9 && this.over === 0) {
		this.over = 1;
		this.alarm[2] = 4;
	}
}

export { create, alarm3, alarm2, step, updateAlarms, updateGamemakerFunctions };