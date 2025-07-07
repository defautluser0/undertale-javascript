import { draw_set_color, draw_rectangle } from '/imports/assets/gamemakerFunctions.js';
import { c_black } from '/imports/assets.js';

function create() {
	return {
		name: "introtangle",
		depth: -400,
	}
}

function draw() {
	draw_set_color(c_black)
	draw_rectangle(0, 0, 60, 240, false);
	draw_rectangle(260, 0, 320, 240, false);
	draw_rectangle(60, 138, 260, 240, false);
	draw_rectangle(0, 0, 320, 28, false);
}

export { create, draw };