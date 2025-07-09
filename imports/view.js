import roomSize from "/imports/assets/roomSize.js"

let view_xview = [0];
let view_yview = [0];
let view_wview = [640];
let view_hview = [480];
let view_current = 0;


function updateCamera(target) {

	// Clamp room height between 240 and ∞ (though height should generally match room)
	const cameraHeight = Math.max(240, Math.min(480, roomSize.height));
	const scale = 480 / cameraHeight;

	// Use scale to compute camera width from target aspect ratio
	let cameraWidth = 640 / scale;

	// Clamp width between 320 and 640
	cameraWidth = Math.max(320, Math.min(640, cameraWidth));

	// Update view dimensions
	view_hview[view_current] = cameraHeight;
	view_wview[view_current] = cameraWidth;

	// Center camera on player
	let camX = target.x - cameraWidth / 2;
	let camY = target.y - cameraHeight / 2;

	// Clamp camera to room bounds
	if (roomSize.width <= cameraWidth) camX = (roomSize.width - cameraWidth) / 2;
	else camX = Math.max(0, Math.min(camX, roomSize.width - cameraWidth));

	if (roomSize.height <= cameraHeight) camY = (roomSize.height - cameraHeight) / 2;
	else camY = Math.max(0, Math.min(camY, roomSize.height - cameraHeight));

	view_xview[view_current] = camX;
	view_yview[view_current] = camY;
}


export { view_current, view_hview, view_wview, view_xview, view_yview, updateCamera }