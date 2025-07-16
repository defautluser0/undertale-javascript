import { draw_sprite_ext, instance_create, instance_exists } from "/imports/assets/gamemakerFunctions.js";
import { c_white } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as parent from "/obj/interactable/index.js"
import * as obj_dialoguer from "/obj/dialoguer/index.js";

function create() {
	const alarm = new Array(12).fill(-1);

	// create code

	return {
		name: "readable", // sprite name
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
		myinteract: 0,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
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
}

function updateSprite() {
	if (this.visible === true) { 
		draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha);
	}
}

function alarm0() {
	this.myinteract = 3;
	global.msg[0] = " MROWW /";
	global.msg[1] = " HOW are you reading thios ???? /";
	global.msg[2] = " wait are you reading the source /";
	global.msg[3] = " cool /";
	global.msg[4] = " no but seriously if this is actually ingame please report this error /%%";
	global.msg[5] = " %%%"
	global.typer = 5;
	global.facechoice = 0;
	global.faceemotion = 0;
	this.mydialoguer = instance_create(0, 0, obj_dialoguer);
}

function step() {
	if (this.myinteract == 1)
	{
		global.interact = 1;
		this.alarm[0] = 1;
		this.myinteract = 2;
	}

	if (this.myinteract == 3)
	{
		if (instance_exists(obj_dialoguer) === false)
		{
			global.interact = 0;
			this.myinteract = 0;
		}
	}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, alarm0, step, parent };