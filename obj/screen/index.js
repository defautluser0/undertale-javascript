import { ogCtx, ctx, ogCanvas, canvas } from "/imports/canvasSetup.js"
import { view_xview, view_yview, view_current, view_hview, view_wview } from "/imports/view.js"
import global from "/imports/assets/global.js"
import { keyboard_check, room_goto, ord, keyboard_check_pressed, instance_exists, instance_create, ini_open, ini_close, ini_read_real, ini_read_string } from "/imports/assets/gamemakerFunctions.js";
import { vk_up, vk_down, vk_left, vk_right, vk_escape } from "/imports/input.js"
import * as obj_quittingmessage from "/obj/quittingmessage/index.js"
import { textdata_en } from "/imports/assets/text.js";

function updateScreen() {
	const viewX = view_xview[view_current];
	const viewY = view_yview[view_current];
	const viewW = view_wview[view_current];
	const viewH = view_hview[view_current];

	const scale = ogCanvas.height / viewH;
	const scaledWidth = viewW * scale;
	const offsetX = (ogCanvas.width - scaledWidth) / 2;

	ogCtx.clearRect(0, 0, ogCanvas.width, ogCanvas.height);

	// Fill black background (letterbox if needed)
	ogCtx.fillStyle = "black";
	ogCtx.fillRect(0, 0, ogCanvas.width, ogCanvas.height);

	ogCtx.drawImage(
		canvas,
		viewX, viewY,
		viewW, viewH,
		offsetX, 0,
		scaledWidth, ogCanvas.height
	);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.setItem("global", JSON.stringify(global));
}

function create() {
  if (!global.textdata_en) {
    textdata_en();
  }
}

function beginStep() {
  global.up = keyboard_check(vk_up);
  global.down = keyboard_check(vk_down);
  global.left = keyboard_check(vk_left);
  global.right = keyboard_check(vk_right);
  if (global.debug == 1)
  {
    if (keyboard_check_pressed(ord("R")))
    {
      global.debug_r += 1;
      
      if (global.debug_r > 5)
        room_goto("room_introstory");
      
      global.spec_rtimer = 1;
    }
  }
  
  global.spec_rtimer += 1;
  
  if (global.spec_rtimer >= 6)
      global.debug_r = 0;
  
  if (keyboard_check(vk_escape))
  {
    global.quit += 1;
      
    if (instance_exists(obj_quittingmessage) == 0)
        instance_create(0, 0, obj_quittingmessage);
  }
  else
  {
    global.quit = 0;
  }
  ini_open("config.ini")
  global.lang = ini_read_string("General", "lang", "");
  global.screen_border_id = ini_read_real("General", "sb", -1);
  global.button0 = ini_read_real("joypad1", "b0", -1);
  global.button1 = ini_read_real("joypad1", "b1", -1);
  global.button2 = ini_read_real("joypad1", "b2", -1);
  global.analog_sense = ini_read_real("joypad1", "as", -1);
  global.joy_dir = ini_read_real("joypad1", "jd", -1);
  ini_close();
}

function endStep() {
  if (global.quit > 20)
  {
    window.location.href = "about:blank";
  }
}

export { updateScreen, create, beginStep, endStep };