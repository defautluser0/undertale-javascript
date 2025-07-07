// setup
import global from '/imports/assets/global.js';
import roomSize from '/imports/assets/roomSize.js'

const ogCanvas = document.getElementById("gameCanvas");
const ogCtx = ogCanvas.getContext("2d");
ogCtx.imageSmoothingEnabled = false;
const canvas = document.createElement('canvas');
canvas.width = roomSize.width;
canvas.height = roomSize.height;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.textBaseline = "top";
if (global.debug === 1) {
	document.getElementsByTagName("body")[0].appendChild(canvas);
	canvas.style.border = "8px dashed red";
	canvas.style.position = "absolute";
}

export { canvas, ogCanvas, ctx, ogCtx }