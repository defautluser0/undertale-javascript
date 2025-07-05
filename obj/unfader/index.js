let image_xscale = room_width * 2;
let image_yscale = room_height
action_move_to(0, 0);
let image_alpha = 0;
let tspeed =  0.08;
let over = 0;

function unfader_step() {
	image_alpha += tspeed;
}

function roomStart() {
	action_kill_object()
}

function roomEnd() {
	action_kill_object()
}

export { unfader_step, roomStart, roomEnd }