import roomSize from "/imports/assets/roomSize.js"

let view_xview = [0];
let view_yview = [0];
let view_wview = [640];
let view_hview = [480];
let view_current = 0;

function updateCamera(x, y) {
	view_xview[view_current] = Math.min(Math.max(x, 0), roomSize.width - view_wview[view_current]);
	view_yview[view_current] = Math.min(Math.max(y, 0), roomSize.height - view_hview[view_current]);
}

export { view_current, view_hview, view_wview, view_xview, view_yview, updateCamera }