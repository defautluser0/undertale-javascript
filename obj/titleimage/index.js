import { caster_load, caster_play, caster_free, scr_setfont, snd_play } from "/imports/customFunctions.js"
import { mus_intronoise, spr_undertaletitle, c_gray, c_white, fnt_small, fnt_maintext, snd_ballchime } from "/imports/assets.js"
import { room_goto, draw_sprite, draw_sprite_ext, draw_set_color, draw_text, keyboard_check_pressed, ord } from "/imports/assets/gamemakerFunctions.js";
import { control_check_pressed } from "/imports/input.js"


function create() {
	const alarm = new Array(12).fill(-1);

	const intronoise = caster_load(mus_intronoise);
	caster_play(intronoise);

	alarm[0] = 600;
	alarm[1] = 100;

	return {
		name: "titleimage",
		depth: 0,
		image_xscale: spr_undertaletitle.width,
		image_yscale: spr_undertaletitle.height,
		x: 0,
		y: 0,
		image_alpha: 0,
		image_index: 0,
		image_speed: 0,
		image_number: 1,
		sprite_index: spr_undertaletitle,

		ballammount: 0,
		d: 0,
		special_x: 0,
		drawpw: 0,
		pw1: 0,
		pw2: 0,
		pw3: 0,
		proceed: 0,
		intronoise: intronoise,

		alarm: alarm,

		alarm0,
		alarm1,
		step,
		draw,
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
	}
}

function draw() {
	draw_sprite(this.sprite_index, 0, this.x, this.y);

	if (this.d === 1) {
		draw_set_color(c_gray);
		scr_setfont(fnt_small);

		draw_text(120, 180, "[PRESS Z OR ENTER]")
	}

	this.proceed = control_check_pressed(0);

	switch (this.ballammount) {
		case 0:
			if (keyboard_check_pressed(ord("B"))) {
				this.ballammount = 1;
			}
			break;

		case 1:
			if (keyboard_check_pressed(ord("A"))) {
				this.ballammount = 2;
			}
			break;

		case 2:
			if (keyboard_check_pressed(ord("L"))) {
				this.ballammount = 3;
			}
			break;

		case 3:
			if (keyboard_check_pressed(ord("L"))) {
				this.ballammount = 4;
				snd_play(snd_ballchime);
			}
			break;
	}

	if (control_check_pressed(1)) {
		this.special_x += 1;

		if (this.special_x >= 5) {
			this.alarm[0] = 1800;
			this.alarm[1] = -1;
			this.d = 0;
			this.drawpw = 1;
		}
	}

	if (this.drawpw === 1) {
		this.d = 0;
		this.alarm[0] === 999;
		draw_set_color(c_white);
		scr_setfont(fnt_maintext);

		if (this.pw1 === 0 && this.pw2 === 0 && this.pw3 === 0) {
			draw_text(20, 180, "No Information");
		}

		if (this.pw1 === 1) {
			draw_text(20, 170, "Activity Level A");
		}

		if (this.pw2 === 1) {
			draw_text(20, 190, "Activity Level B");
		}

		if (this.pw3 === 1) {
			draw_text(20, 210, "Activity Level C");
		}
	}
}

function alarm0() {
	caster_free(this.intronoise);
	room_goto("room_introstory");
}

function alarm1() {
	this.d = 1;
}

function updateAlarms() {
  for (let i = 0; i < this.alarm.length; i++) {
    if (this.alarm[i] > 0) {
      this.alarm[i]--;
      if (this.alarm[i] === 0) {
        const handler = this[`alarm${i}`];
        if (typeof handler === "function") handler.call(this); // call with instance context
      }
    } else if (this.alarm[i] === 0) {
      this.alarm[i]--;
    }
  }
}

function updateGamemakerFunctions() {
	this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }
}

function updateSprite() {
	draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha);
}

function step() {
	if (this.proceed) {
		caster_free(this.intronoise);
		room_goto("room_intromenu")
	}
}

export { create, draw, alarm0, alarm1, updateGamemakerFunctions, updateAlarms, updateSprite, step }