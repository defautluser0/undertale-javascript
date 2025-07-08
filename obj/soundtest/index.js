// function/declaration imports
import {
  scr_setfont,
  scr_drawtext_icons_multiline,
  scr_drawtext_centered_scaled,
  scr_drawtext_centered,
} from "/imports/customFunctions.js";
import { control_check_pressed, vk_left, vk_right } from "/imports/input.js";
import {
  draw_set_color,
  audio_is_playing,
  audio_play_sound,
  audio_stop_all,
  keyboard_check_pressed,
  draw_text,
  room_goto,
} from "/imports/assets/gamemakerFunctions.js";
import { canvas, ctx, ogCanvas, ogCtx } from "/imports/canvasSetup.js";
import { view_current, view_hview, view_wview, view_xview, view_yview, updateCamera } from "/imports/view.js"
// asset imports
import {
  c_white,
  c_yellow,
  mus_st_happytown,
  mus_st_him,
  mus_st_meatfactory,
  mus_st_troubledingle,
  fnt_main,
} from "/imports/assets.js";

// create
function create() {
  return {
    con: 0,
    songno: 0,
    gaster: 0,
    g_timer: 0,
    buffer: 0,
    active_l: 0,
    active_r: 0,
    seeya_timer: 0,
  };
}

function updateGamemakerFunctions() {
  ogCtx.clearRect(0, 0, ogCanvas.width, ogCanvas.height);
  ogCtx.drawImage(
    canvas,
    view_xview[view_current],
    view_yview[view_current],
    view_wview[view_current],
    view_hview[view_current],
    0,
    0,
    ogCanvas.width,
    ogCanvas.height
  );
  updateCamera(100, 0);
}

function step() {
  // step starts here
  if (this.seeya_timer >= 180) {
    room_goto("room_tundra3A");
  }
  // step ends ere
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (this.con === 0) {
    draw_set_color(c_white);
    scr_setfont(fnt_main);
    scr_drawtext_icons_multiline(
      120,
      50,
      "Welcome to the Sound Test!#Listen to all your favorites.#Press Left or Right to select.#Press *Z to play a song.#",
      2,
    );
    this.buffer++;

    if (this.buffer >= 20) {
      if (control_check_pressed(0)) {
        this.buffer = -10;
        this.con = 1;
        this.songno = 0;
      }
    }
  }

  if (this.con === 1) {
    scr_setfont(fnt_main);
    draw_set_color(c_white);
    scr_drawtext_centered_scaled(320, 50, "SOUND TEST", 2, 2);

    switch (this.songno) {
      case 0:
        if (audio_is_playing(mus_st_happytown)) {
          draw_set_color(c_yellow);
        } else if (control_check_pressed(0) && this.gaster === 0) {
          audio_stop_all();
          audio_play_sound(mus_st_happytown, 50, true);
        }
        scr_drawtext_centered(320, 200, "Happy Town");
        break;

      case 1:
        if (audio_is_playing(mus_st_meatfactory)) {
          draw_set_color(c_yellow);
        } else if (control_check_pressed(0) && this.gaster === 0) {
          audio_stop_all();
          audio_play_sound(mus_st_meatfactory, 50, true);
        }
        scr_drawtext_centered(320, 200, "Meat Factory");
        break;

      case 2:
        if (audio_is_playing(mus_st_troubledingle)) {
          draw_set_color(c_yellow);
        } else if (control_check_pressed(0) && this.gaster === 0) {
          audio_stop_all();
          audio_play_sound(mus_st_troubledingle, 50, true);
        }
        scr_drawtext_centered(320, 200, "Trouble Dingle");
        break;

      case 3:
        if (audio_is_playing(mus_st_him)) {
          draw_set_color(c_yellow);
        } else if (control_check_pressed(0) && this.gaster === 0) {
          this.gaster = 1;
          audio_stop_all();
          audio_play_sound(mus_st_him, 50, true);
        }
        scr_drawtext_centered(320, 200, "Gaster's Theme");
        break;
    }

    this.buffer++;

    if (keyboard_check_pressed(vk_left) && this.buffer > 0 && this.active_l < 0) {
      if (this.gaster === 0) {
        this.songno++;
        if (this.songno > 3) this.songno = 0;
        this.active_l = 10;
      } else {
        this.active_l = 2;
        this.songno--;
        if (this.songno < 0) this.songno = 3;
      }
    }

    if (keyboard_check_pressed(vk_right) && this.buffer > 0 && this.active_r < 0) {
      this.active_r = 10;
      this.songno++;
      if (this.songno > 3) this.songno = 0;
      if (this.gaster === 1) this.active_r = 2;
    }

    this.active_l--;
    this.active_r--;

    draw_set_color(c_white);
    if (this.active_l > 0) draw_set_color(c_yellow);
    draw_text(50, 200, "<<");

    draw_set_color(c_white);
    if (this.active_r > 0) draw_set_color(c_yellow);
    draw_text(580, 200, ">>");

    if (this.gaster === 1) this.g_timer++;

    if (this.g_timer >= 600) {
      audio_stop_all();
      this.con = 3;
    }
  }

  if (this.con === 3) {
    draw_text(150, 50, "Thanks for your feedback!");
    draw_text(150, 80, "Be seeing you soon!");
    this.seeya_timer++;
  }
}

export { create, step, draw, updateGamemakerFunctions };