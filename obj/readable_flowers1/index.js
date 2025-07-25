import { draw_sprite_ext, instance_create, instance_destroy, getBoundingBox } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as parent from "/obj/readable/index.js"
import * as obj_dialoguer from "/obj/dialoguer/index.js";

function create() {
	const alarm = new Array(12).fill(-1);

	// create code

	return {
		name: "readable_flowers1", // sprite name
		depth: 0, // object depth
		image_xscale: 2, // sprite scale
		image_yscale: 1.5, // sprite scale
		x: 0, // object x. this is set by room
		y: 0, // object y. this is set by room
		image_alpha: 1, // sprite alpha
		image_index: 0, // sprite frame index
		image_speed: 0, // sprite frame speed
		image_number: 0, // sprite frame number
		sprite_index: "spr_interactable", // sprite object
		visible: false, // sprite visibility
		parent: parent,

		alarm: alarm, // alarm array

		// any variables assigned inside create code
		myinteract: 0,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		roomStart,
		alarm0,
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
	if (this.image_index >= this.image_number) {
		this.image_index -= this.image_number;
	}

	getBoundingBox.call(this);
}

function updateSprite() {
	if (this.visible) {
		draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha)
	}
}

function roomStart() {
	if (global.plot === 0) {
		instance_destroy(this);
	}
}

function alarm0() {
	this.myinteract = 3;
	global.msc = 500;
	global.typer = 5;
	global.facechoice = 0;
	global.faceemotion = 0;
	this.mydialoguer = instance_create(0, 0, obj_dialoguer)
}

function step() {
	this.parent.step.call(this);
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, roomStart, alarm0, step, parent };