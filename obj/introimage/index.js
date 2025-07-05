import { mus_story } from '/imports/assets.js';
import global from '/imports/assets/global.js'

// general gamemaker variables
let image_index = 0;
let image_speed = 0;
let image_number = 11;
let visible = true;

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
let intromusic = mus_story;
image_speed = 0;
visible = false;


function alarm2() {
	act = 1;
	let dongs = 0;
	image_speed = 0;
	let vol = 1;
	

}

function introimage_beginStep() {

}

function introimage_step() {

}

export { introimage_beginStep, introimage_step, updateGamemakerFunctions_introimage }