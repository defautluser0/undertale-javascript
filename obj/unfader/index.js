import { instance_destroy } from '/imports/assets/gamemakerFunctions.js'
import roomSize from '/imports/assets/roomSize.js'

function create() {
	return {
		image_xscale: roomSize.width * 2,
		image_yscale: roomSize.height,
		image_alpha: 0,
		tspeed: 0.08,
		over: 0,
	}
}

function step() {
	this.image_alpha += this.tspeed;
}

function roomStart() {
	instance_destroy("obj_unfader");
}

function roomEnd() {
	instance_destroy("obj_unfader");
}

export { create, step, roomStart, roomEnd }