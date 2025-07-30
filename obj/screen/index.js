import { ogCtx, ctx, ogCanvas, canvas } from "/imports/canvasSetup.js"
import { final_view_xview, final_view_yview, view_current, final_view_hview, final_view_wview } from "/imports/view.js"
import global from "/imports/assets/global.js"
import { keyboard_check, room_goto, ord, keyboard_check_pressed, instance_exists, instance_create, ini_open, ini_close, ini_read_real, ini_read_string } from "/imports/assets/gamemakerFunctions.js";
import { vk_up, vk_down, vk_left, vk_right, vk_escape } from "/imports/input.js"
import { snd_isplaying, snd_play } from "/imports/customFunctions.js"
import * as obj_quittingmessage from "/obj/quittingmessage/index.js"
import { textdata_en } from "/imports/assets/text.js";

function updateScreen() {
	const viewX = final_view_xview[view_current];
	const viewY = final_view_yview[view_current];
	const viewW = final_view_wview[view_current];
	const viewH = final_view_hview[view_current];

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

  function extractNameFromSrc(src) {
    // src expected: "/imports/assets/mus/xxx.ogg" or "/imports/assets/snd/yyy.ogg"
    const parts = src.split('/');
    if (parts.length < 4) return null; // safeguard

    const folder = parts[3]; // 'mus' or 'snd'
    const filename = parts[4]?.split('.')[0]; // 'xxx' or 'yyy'
    if (!folder || !filename) return null;

    return `${folder}_${filename}`;
  }

	ctx.clearRect(0, 0, canvas.width, canvas.height);
  try {
    localStorage.setItem("global", JSON.stringify(global));
  } catch(_) {
    let currentsong = global.currentsong;
    if (currentsong !== -1) {
      global.currentsong = {
        name: extractNameFromSrc(currentsong._src) ?? "unknown",
        rate: currentsong.rate?.() ?? 1,
        volume: currentsong.volume?.() ?? 1,
        paused: !global.playing1 ?? false,
        pos: currentsong.seek?.() ?? 0,
        loop: currentsong.loop?.() ?? false,
      };
    }
    let currentsong2 = global.currentsong2;
    if (currentsong2 !== -1) {
      global.currentsong2 = {
        name: extractNameFromSrc(currentsong2._src) ?? "unknown",
        rate: currentsong2.rate?.() ?? 1,
        volume: currentsong2.volume?.() ?? 1,
        paused: !global.playing2 ?? false,
        pos: currentsong2.seek?.() ?? 0,
        loop: currentsong2.loop?.() ?? false,
      };
    }
    const batmusic = global.batmusic;
    global.batmusic = -1;
    localStorage.setItem("global", JSON.stringify(global));
    global.currentsong = currentsong;
    global.currentsong2 = currentsong2;
    global.batmusic = batmusic;
  }
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

  global.time += 1;
  
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