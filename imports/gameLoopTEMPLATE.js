import { control_update, input_update } from "/imports/input.js";

// gameloop DO NOT EDIT UNLESS NECESSARY (eg. adding new events).
// IMPORTANT: replace "objectname" with the object name (eg. mainchara) and import it from /obj/object name/index.js
const FPS = 30;
const FRAME_DURATION = 1000 / FPS;
let lastFrameTime = 0;
function game_loop(currentTime) {
  const elapsed = currentTime - lastFrameTime;

  if (elapsed >= FRAME_DURATION) {
    lastFrameTime = currentTime;

    control_update();
    objectname_beginStep();
    objectname_step();
    objectname_endStep();
    objectname_draw();
    input_update();
  }

  requestAnimationFrame(game_loop);
}