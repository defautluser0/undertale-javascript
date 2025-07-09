import { draw_sprite_ext, instance_destroy } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import roomSize from "/imports/assets/roomSize.js"

function create() {
	const alarm = new Array(12).fill(-1);

	// create code

	return {
		name: "persistentfader", // sprite name
		depth: 0, // object depth
		image_xscale: roomSize.width, // sprite scale
		image_yscale: roomSize.height, // sprite scale
		x: -20, // object x. this is set by room
		y: -20, // object y. this is set by room
		image_alpha: 1, // sprite alpha
		image_index: 0, // sprite frame index
		image_speed: 0, // sprite frame speed
		image_number: 0, // sprite frame number
		sprite_index: "spr_pixblk", // sprite object
		visible: true, // sprite visibility

		alarm: alarm, // alarm array

		// any variables assigned inside create code
		tspeed: -0.08,
		over: 1,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		step,
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
	this.image_index = this.image_index;
	if (this.image_index >= this.image_number) {
		this.image_index -= this.image_number;
	}
}

function updateSprite() {
	draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha)
}

function step() {
	this.image_alpha += this.tspeed;
	if (this.image_alpha < 0.02) {
		instance_destroy(this);
	}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, step };