// setup
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

export { canvas, ogCanvas, ctx, ogCtx }