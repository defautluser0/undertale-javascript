import { control_update, input_update } from "/imports/input.js";
import * as objectname from '/obj/objectname/index.js'

const objectnameInstance = objectname.create();

objectnameInstance.x = 0; // edit as necessary
objectnameInstance.y = 0; // edit as necessary

// room start
objectname.roomStart.call(objectnameInstance);

// gameloop DO NOT EDIT VARIABLES UNLESS NECESSARY (eg. changing fps in this room for some reason)
// IMPORTANT: replace "objectname" with the object name (eg. mainchara) and import it from /obj/objectname/index.js as seen above
const FPS = 30;
const FRAME_DURATION = 1000 / FPS;
let lastFrameTime = 0;
function game_loop(currentTime) {
  const elapsed = currentTime - lastFrameTime;

  if (elapsed >= FRAME_DURATION) {
    lastFrameTime = currentTime;

    control_update();
    // object functions that run every frame go here
    objectname.beginStep.call(objectnameInstance);
    objectname.step.call(objectnameInstance);
    objectname.endStep.call(objectnameInstance);
    objectname.draw.call(objectnameInstance);
    // end of object functions section
    input_update();

    if (global.roomEnd && !global.eventDone) {
      global.eventDone = true;
      // roomEnd() code
      objectname.roomEnd.call(objectnameinstance);
    }

    if (global.roomEnd && global.eventDone) {
      global.eventDone = false;
      window.location.href = global.nextRoom;
    }
  }

  requestAnimationFrame(game_loop);
}