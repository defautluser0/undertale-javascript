// setup
import roomSize from "/imports/assets/roomSize.js";

export const ogCanvas = document.getElementById("gameCanvas");
export const ogCtx = ogCanvas.getContext("2d");
ogCtx.imageSmoothingEnabled = false;
export const canvas = document.createElement("canvas");
canvas.width = roomSize.width;
canvas.height = roomSize.height;
export const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.textBaseline = "top";
