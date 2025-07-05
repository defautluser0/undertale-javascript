// function/declaration imports
import { scr_setfont, scr_drawtext_icons_multiline, scr_drawtext_centered_scaled, scr_drawtext_centered } from '/imports/customFunctions.js'
import { control_check_pressed, vk_left, vk_right } from '/imports/input.js'
import { draw_set_color, audio_is_playing, audio_play_sound, audio_stop_all, keyboard_check_pressed, draw_text, room_goto } from '/imports/assets/gamemakerFunctions.js'
import { canvas, ctx } from '/imports/canvasSetup.js'
// asset imports
import { c_white, c_yellow, mus_st_happytown, mus_st_him, mus_st_meatfactory, mus_st_troubledingle, fnt_main } from '/imports/assets.js'

// create
let con = 0
let songno = 0
let gaster = 0
let g_timer = 0
let buffer = 0
let active_l = 0
let active_r = 0
let seeya_timer = 0

function soundtest_step() {
  // step starts here
	if (seeya_timer >= 180) {
		room_goto("room_tundra3A")
	}
		// step ends ere
}

function soundtest_draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw starts here
  if (con === 0) {
    draw_set_color(c_white);
    scr_setfont(fnt_main);
    scr_drawtext_icons_multiline(120, 50, "Welcome to the Sound Test!#Listen to all your favorites.#Press Left or Right to select.#Press \*Z to play a song.#", 2);
    buffer = buffer + 1

    if (buffer >= 20) {
      if (control_check_pressed(0)) {
        buffer = -10;
        con = 1
        songno = 0
      }
    }
  }

  if (con === 1) {
    scr_setfont(fnt_main);
    draw_set_color(c_white);
    scr_drawtext_centered_scaled(320, 50, "SOUND TEST", 2, 2);

    switch (songno) {
    case 0:
      if (audio_is_playing(mus_st_happytown)) {
        draw_set_color(c_yellow);
      }
      else if (control_check_pressed(0) && gaster === 0) {
        audio_stop_all();
        audio_play_sound(mus_st_happytown, 50, true);
      }
      scr_drawtext_centered(320, 200, "Happy Town");
      break;

    case 1:
      if (audio_is_playing(mus_st_meatfactory)) {
        draw_set_color(c_yellow);
      }
      else if (control_check_pressed(0) && gaster === 0) {
        audio_stop_all();
        audio_play_sound(mus_st_meatfactory, 50, true);
      }
      scr_drawtext_centered(320, 200, "Meat Factory");
      break;

    case 2:
      if (audio_is_playing(mus_st_troubledingle)) {
        draw_set_color(c_yellow);
      }
      else if (control_check_pressed(0) && gaster === 0) {
        audio_stop_all();
        audio_play_sound(mus_st_troubledingle, 50, true);
      }
      scr_drawtext_centered(320, 200, "Trouble Dingle");
      break;

    case 3:
      if (audio_is_playing(mus_st_him)) {
        draw_set_color(c_yellow);
      }
      else if (control_check_pressed(0) && gaster === 0) {
        gaster = 1;
        audio_stop_all();
        audio_play_sound(mus_st_him, 50, true);
      }
      scr_drawtext_centered(320, 200, "Gaster's Theme");
      break;
    }

    buffer += 1;

    if (keyboard_check_pressed(vk_left) && buffer > 0 && active_l < 0) {
      if (gaster === 0) {
        songno += 1;

        if (songno > 3) songno = 0;

        active_l = 10;
      } else {
        active_l = 2;
        songno -= 1
        if (songno < 0) songno = 3;
      }
    }

    if (keyboard_check_pressed(vk_right) && buffer > 0 && active_r < 0)
    {
      active_r = 10;
      songno = songno + 1;
      
      if (songno > 3) songno = 0;
      
      if (gaster === 1) active_r = 2;
    }

    active_l -= 1;
    active_r -= 1;
    draw_set_color(c_white);
    if (active_l > 0) {
      draw_set_color(c_yellow);
    }
    draw_text(50, 200, "<<");
    draw_set_color(c_white);
    if (active_r > 0) {
      draw_set_color(c_yellow);
    }
    draw_text(580, 200, ">>");

    if (gaster == 1) {
      g_timer += 1;
    }

    if (g_timer >= 600) {
      audio_stop_all();
      con = 3;
    }
  }
  if (con === 3) {
    draw_text(150, 50, "Thanks for your feedback!");
    draw_text(150, 80, "Be seeing you soon!");
    seeya_timer += 1;
  }
  // draw ends here
}

export { soundtest_step, soundtest_draw }