import { draw_set_color, draw_rectangle } from '/imports/assets/gamemakerFunctions.js';
import { c_black, c_red } from '/imports/assets.js';
import { instance_destroy } from '/imports/assets/gamemakerFunctions.js';

function create() {
	instance_destroy(this);
	return {
		name: "introtangle",
		depth: -400,
	}
}

function draw() {
	draw_set_color(c_red)
	draw_rectangle(0, 0, 60, 240, false);
	draw_rectangle(260, 0, 320, 240, false);
	draw_rectangle(60, 140, 260, 240, false);
	draw_rectangle(0, 0, 320, 30, false);
}

export { create/*, draw */ };