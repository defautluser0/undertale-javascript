import { ogCtx, ctx, ogCanvas, canvas } from "/imports/canvasSetup.js"
import { view_xview, view_yview, view_current, view_hview, view_wview } from "/imports/view.js"
import roomSize from "/imports/assets/roomSize.js"

function updateScreen() {
	ogCtx.clearRect(0, 0, ogCanvas.width, ogCanvas.height);
  ogCtx.drawImage(
    canvas,
    view_xview[view_current],
    view_yview[view_current],
    roomSize.width,
    roomSize.height,
    0,
    0,
    view_wview[view_current],
    view_hview[view_current],
  );
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export { updateScreen };