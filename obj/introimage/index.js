import { caster_load, caster_play, caster_stop, caster_free, caster_set_volume } from '/imports/customFunctions.js';
import { mus_story } from '/imports/assets.js';
import global from '/imports/assets/global.js'

// general gamemaker variables
let image_index = 0;
let image_speed = 0;
let image_number = 11;
let visible = true;
let x = 0;
let y = 0;
let instanceID = 0;

// alarm setup
const alarm = new Array(12).fill(-1);
function updateGamemakerFunctions_introimage() {
	for (let i = 0; i < alarm.lenght; i++) {
		if (alarm[i] > 0) {
			alarm[i]--;
			if (alarm[i] === 0) {
				globalThis[`alarm${i}`];
			}
		}
	}
	image_index += image_speed;
	if (image_index >= image_number) {
		image_index -=  image_number;
	}
}

// ut code starts here
let skip = 0;
let act = 0;
alarm[2] = 4;
let intromusic = caster_load(mus_story);
image_speed = 0;
visible = false;
let fadercreator = undefined;
let vol = undefined;
let dongs = undefined;

function alarm2() {
	act = 1;
	dongs = 0;
	image_speed = 0;
	vol = 1;
	caster_play(intromusic, 1, 0.91);
	global.typer =  11;
	global.faceemotion = 0;
	global.msc = 0;
	//instance_create(0, 0, obj_introtangle);
  fadercreator = 0;
	skip = 0;
	global.msg[0] = "Long ago^1, two races&ruled over Earth^1:&HUMANS and MONSTERS^6. \E1 ^1 %"
	global.msg[1] = "One day^1, war broke&out between the two&races^6. \E0 ^1 %"
	global.msg[2] = "After a long battle^1,&the humans were&victorious^6. \E1 ^1 %"
	global.msg[3] = "They sealed the monsters&underground with a magic&spell^6. \E0 ^1 %"
	global.msg[4] = "Many years later^2.^2.^5.  \E1 ^1 %"
	global.msg[5] = "      MT. EBOTT&         201X^9 \E0 %"
	global.msg[6] = "Legends say that those&who climb the mountain&never return^5.^3 \E1 %"
	global.msg[7] = " \E1 %"
	global.msg[8] = " ^9 ^5 \E0 %"
	global.msg[9] = " ^9 ^5 ^2 \E1 %"
	global.msg[10] = " ^9 ^5 ^2 \E2 %"
	global.msg[11] = " ^9 ^9 ^9 ^9 ^9 ^9 \E2 %%"
	global.msg[12] = " ^9 ^9 ^9 ^9 ^9  \E0 %%"
	global.msg[13] = " ^9 ^9 ^9 ^9 ^9 ^9 \E0 %"
	global.msg[14] = " %%"
	// let mywriter = instance_create(40, 140, OBJ_WRITER);
	alarm[0] = 5;
}

function alarm1() {
	caster_stop(intromusic);
	caster_free(intromusic);
	// room_goto_next()
}

function alarm0() {
	if (fadercreator !== global.faceemotion) {
		// instance_create(0, 0, obj_introfader);
	}
	alarm[0] = 3
	fadercreator = global.faceemotion;
}

function introimage_beginStep() {
	if (act === 1) {
		if (instance_exists(OBJ_WRITER) === 0 && skip === 0) {
			skip = 1;
			fader = instance_create(0, 0, obj_unfader);
			fader.tspeed = 0.05;
			alarm[1] = 30;
		}

		if (skip === 1) {
			vol -= 0.05;
			caster_set_volume(intromusic, vol);
		}

		if (global.faceemotion == 2 && dongs == 0) {
			dongs = 1;
			instance_create()
		}
	}
}

function introimage_step() {

}

export { introimage_beginStep, introimage_step, updateGamemakerFunctions_introimage, instanceID }