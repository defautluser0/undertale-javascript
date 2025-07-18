import global from "/imports/assets/global.js";
import { keyboard_check_pressed, ord } from "/imports/assets/gamemakerFunctions.js";

function create() {
	const phase = 0;
	return {
		phase: phase,
		visible: false,

		step,
	}
}

function step(visible) {
	if (keyboard_check_pressed(ord("V"))) {
		if (global.debug === 1) {
			if (visible === false) {
				visible = true;
			} else {
				visible = false
			}
		}
	}
	return visible;
}

export { create, step };