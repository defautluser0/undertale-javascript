import { draw_sprite_ext, draw_set_color, draw_rectangle } from "/imports/assets/gamemakerFunctions.js";
import { c_white, c_black } from "/imports/assets.js";

function create() {
	const alarm = new Array(12).fill(-1);

	// create code

	return {
		name: "introtangle", // sprite name
		depth: -400, // object depth
		image_xscale: 1, // sprite scale
		image_yscale: 1, // sprite scale
		x: 0, // object x. this is set by room
		y: 0, // object y. this is set by room
		image_alpha: 1, // sprite alpha
		image_index: 0, // sprite frame index
		image_speed: 0, // sprite frame speed
		image_number: 0, // sprite frame number
		sprite_index: null, // sprite object
		visible: false, // sprite visibility
		parent: parent,

		alarm: alarm, // alarm array

		// any variables assigned inside create code

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		draw,
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
}

function updateSprite() {
	if (this.visible === true) { 
		draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha);
	}
}

function draw() {
	draw_set_color(c_black);
	draw_rectangle(0, 0, 60, 240);
	draw_rectangle(260, 0, 320, 240);
	draw_rectangle(60, 140, 260, 240);
	draw_rectangle(0, 0, 320, 30)
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, draw };