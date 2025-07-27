import { ogCanvas } from "/imports/canvasSetup.js";
import roomSize from "/imports/assets/roomSize.js";
import global from "/imports/assets/global.js";

let view_xview = [0];
let view_yview = [0];
let final_view_xview = [0];
let final_view_yview = [0];
let view_wview = [0];
let view_hview = [0];
let final_view_wview = [640];
let final_view_hview = [480];
let view_offset_xview = [0];
let view_offset_yview = [0];
let view_offset_wview = [0];
let view_offset_hview = [0];
let view_current = 0;

function updateCamera(target) {
  view_offset_xview[view_current] = view_xview[view_current] - final_view_xview[view_current];
  view_offset_yview[view_current] = view_yview[view_current] - final_view_yview[view_current];
  view_offset_wview[view_current] = view_wview[view_current] - final_view_wview[view_current];
  view_offset_hview[view_current] = view_hview[view_current] - final_view_hview[view_current];

  const screenWidth = ogCanvas.width;
  const screenHeight = ogCanvas.height;

  // Start with base view size
  let viewWidth = screenWidth;
  let viewHeight = screenHeight;

  // Adjust view size if room is smaller
  if (roomSize.width < screenWidth) {
    viewWidth = roomSize.width;
  }
  if (roomSize.height < screenHeight) {
    viewHeight = roomSize.height;
  }

  // Calculate final scale
  const scaleX = screenWidth / viewWidth;
  const scaleY = screenHeight / viewHeight;
  const scale = Math.max(scaleX, scaleY); // Fit to smallest constraint

  // Compute actual camera dimensions in room units
  const cameraWidth = screenWidth / scale;
  const cameraHeight = screenHeight / scale;

  // Assign to view variables
  final_view_wview[view_current] = cameraWidth + view_offset_hview[view_current];
  final_view_hview[view_current] = cameraHeight + view_offset_wview[view_current];

  // Center camera on target
  let camX = target.x - cameraWidth / 2;
  let camY = target.y - cameraHeight / 2;

  // Clamp to room bounds
  camX = Math.max(0, Math.min(camX, roomSize.width - cameraWidth));
  camY = Math.max(0, Math.min(camY, roomSize.height - cameraHeight));

  final_view_xview[view_current] = camX + view_offset_xview[view_current];
  final_view_yview[view_current] = camY + view_offset_yview[view_current];

  view_xview[view_current] = final_view_xview[view_current];
  view_yview[view_current] = final_view_yview[view_current];
  view_wview[view_current] = final_view_wview[view_current];
  view_hview[view_current] = final_view_hview[view_current];
}

export { view_current, view_hview, view_wview, view_xview, view_yview, updateCamera, final_view_hview, final_view_wview, final_view_xview, final_view_yview }