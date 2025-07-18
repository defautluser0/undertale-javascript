import { draw_sprite_ext, instance_exists, instance_create, instance_destroy, instances, script_execute, draw_set_color, draw_rectangle } from "/imports/assets/gamemakerFunctions.js";
import { c_white, c_black } from "/imports/assets.js";
import { view_xview, view_yview, view_current } from "/imports/view.js";
import { scr_facechoice } from "/imports/customFunctions.js";;
import { control_check_pressed, control_clear } from "/imports/input.js"
import global from "/imports/assets/global.js";

import * as obj_mainchara from "/obj/mainchara/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";
import * as obj_face from "/obj/face/index.js";
import * as obj_face_torielblink from "/obj/face_torielblink/index.js";
import * as obj_face_torieltalk from "/obj/face_torieltalk/index.js"
import * as obj_face_floweytalk from "/obj/face_floweytalk/index.js"
import * as obj_face_sans from "/obj/face_sans/index.js";
import * as obj_face_papyrus from "/obj/face_papyrus/index.js";
import * as obj_face_undyne from "/obj/face_undyne/index.js";
import * as obj_face_alphys from "/obj/face_alphys/index.js";
import * as obj_face_asgore from "/obj/face_asgore/index.js";
import * as obj_face_mettaton from "/obj/face_mettaton/index.js";
import * as obj_face_asriel from "/obj/face_asriel/index.js";

const parent = null;

function create() {
	const alarm = new Array(12).fill(-1);

	// create code
	let count = 0;
	let side = 0;
	global.facechange = 0;
	let xx = view_xview[view_current];
	let yy = view_yview[view_current];

	return {
		name: "dialoguer", // sprite name
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
		count: count,
		side: side,
		xx: xx,
		yy: yy,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		destroy,
		step,
		draw,
		roomStart,
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

function destroy() {
	if (instance_exists(obj_face) === true) {
		instance_destroy(obj_face)
	}
}

function step() {
	if (!instance_exists(OBJ_WRITER)) {
		instance_destroy(this);
	} else if (control_check_pressed(1)) {
		if (this.writer.halt === 0) {
			if (global.typer !== 10) {
				global.flag[25] += 1;
				this.writer.stringpos = this.writer.originalstring.length;
			}
		}
		control_clear(1);
	}

	if (global.facechange === 2) {
		global.facechange = 0;
	}
	
	if (global.facechange === 1 && global.facechoice === 0) {
		if (instance_exists(this.writer)) {
			this.writer.x = this.xx + 30;
			this.writer.writingx = this.writer.x;
			this.writer.writingxend = this.writer.writingxend_base;
		}

		if (instance_exists(obj_face)) {
			instance_destroy(obj_face);
		}

		global.facechange = 2;
	}

	if (global.facechange === 1) {
		if (instance_exists(this.writer)) {
			this.writer.x = this.xx + 68;
			this.writer.writingx = this.writer.x + 20;
			this.writer.writingxend = this.writer.writingxend_base;

			switch (global.facechoice) {
				case 1:
					if (!instance_exists(obj_face_torieltalk) && !instance_exists(obj_face_torielblink)) {
						script_execute.call(this, scr_facechoice);
					}
					break;
				case 2:
					if (!instance_exists(obj_face_floweytalk)) {
						script_execute.call(this, scr_facechoice);
					}
					break;
				case 3:
					if (!instance_exists(obj_face_sans))
            script_execute.call(this, scr_facechoice);
					break;
				case 4:
					if (!instance_exists(obj_face_papyrus))
            script_execute.call(this, scr_facechoice);
					break;
				case 5:
					if (!instance_exists(obj_face_undyne)) 
						script_execute.call(this, scr_facechoice);
					break;
				case 6:
					if (!instance_exists(obj_face_alphys))
						script_execute.call(this, scr_facechoice);
					break;
				case 7:
					if (!instance_exists(obj_face_asgore))
						script_execute.call(this, scr_facechoice);
					break;
				case 8:
					if (!instance_exists(obj_face_mettaton))
						script_execute.call(this, scr_facechoice);
					break;
				case 9:
					if (!instance_exists(obj_face_asriel))
						script_execute.call(this, scr_facechoice);
					break;
			}
			global.facechange = 2;
		}
	}
}

function draw() {
	if (this.side === 0) {
		this.yy = view_yview[view_current];
		
		if (instance_exists(this.writer)) {
			if (this.writer.writingy > (this.yy + 80)) {
				this.writer.writingy -= 155;
			}
		}
		if (instance_exists(obj_face)) {
			if (instances.get(obj_face).find(inst => inst.y > this.yy + 80)) {
				obj_face.y -= 155;
			}
		}

		draw_set_color(c_white);
    draw_rectangle(view_xview[view_current] + 16, view_yview[view_current] + 5, view_xview[view_current] + 304, view_yview[view_current] + 80, false);
    draw_set_color(c_black);
    draw_rectangle(view_xview[view_current] + 19, view_yview[view_current] + 8, view_xview[view_current] + 301, view_yview[view_current] + 77, false);
	} else {
		this.yy = view_yview[view_current];
		
		if (instance_exists(this.writer)) {
			if (this.writer.writingy < (this.yy + 80)) {
				this.writer.writingy += 155;
			}
		}
		if (instance_exists(obj_face)) {
			if (instances.get(obj_face).find(inst => inst.y < this.yy + 80)) {
				instances.get(obj_face)[0].y += 155;
			}
		}

		draw_set_color(c_white);
		draw_rectangle(view_xview[view_current] + 16, view_yview[view_current] + 160, view_xview[view_current] + 304, view_yview[view_current] + 235, false);
    draw_set_color(c_black);
    draw_rectangle(view_xview[view_current] + 19, view_yview[view_current] + 163, view_xview[view_current] + 301, view_yview[view_current] + 232, false);
	}
	this.count = 1;
}

function roomStart() {
	if (instance_exists(obj_mainchara)) {
		const found = (instances.get(obj_mainchara)).find(inst => inst.y > (this.yy + 130));
		if (found) {
			this.side = 0;

			if (global.facechoice !== 0) {
				this.writer = instance_create(this.xx + 68, this.yy - 5, OBJ_WRITER);
				script_execute.call(this, scr_facechoice);
			} else {
				writer = instance_create(this.xx + 10, this.yy - 5, OBJ_WRITER);
			}
		} else {
			this.side = 1;

			if (global.facechoice != 0)
			{
				this.writer = instance_create(this.xx + 68, this.yy + 150, OBJ_WRITER);
				script_execute.call(this, scr_facechoice);
			} else {
				this.writer = instance_create(this.xx + 10, this.yy + 150, OBJ_WRITER);
			}
		}
	}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, destroy, step, draw, roomStart };