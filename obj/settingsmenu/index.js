import { draw_sprite_ext, ini_open, ini_read_real, ini_write_real, ini_write_string, ini_close, file_exists, room_goto, instance_create, draw_set_color, draw_text_transformed, draw_text, merge_color, choose, draw_circle, keyboard_check_pressed, draw_rectangle, ini_import, ini_export, file_text_import, file_text_export } from "/imports/assets/gamemakerFunctions.js";
import { caster_free, caster_load, scr_setfont, scr_drawtext_centered_scaled, caster_play, caster_loop } from "/imports/customFunctions.js";
import { c_white, c_yellow, c_orange, c_red, c_gray, c_black, mus_harpnoise, mus_options_winter, mus_options_fall, mus_options_summer, fnt_maintext } from "/imports/assets.js";
import { vk_down, vk_up, vk_left, vk_right, control_check_pressed } from "/imports/input.js"
import global from "/imports/assets/global.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as obj_ct_fallobj from "/obj/ct_fallobj/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
	let num_borders = 10;
	let border_enabled = [1, 1, 1, 1]
	let fun = 0;

	for (let i = 4; i <= num_borders; i++) {
		border_enabled[i] = 0;
	}

	ini_open("undertale.ini");
	if (file_exists("file0")) {
		fun = 1;
		let Won = ini_read_real("General", "Won", 0);
		let CP = ini_read_real("General", "CP", 0);
		let CH = ini_read_real("General", "CH", 0);
		let BW = ini_read_real("General", "BW", 0);
		let BP = ini_read_real("General", "BP", 0);
		let BH = ini_read_real("General", "BH", 0);
		let EndF = ini_read_real("EndF", "EndF", 0);

		if ((Won || BW) || (CP || BP)) {
			for (let i = 4; i <= 8; i++) {
				border_enabled[i] = 1;
			}
		}

		if (CP || BP) {
			border_enabled[9] = 1;
		}

		if (CH || BH) {
			border_enabled[10] = 1;
		}

		if (EndF >= 2) {
			fun = 0;
		}
	}
	ini_close();

	let menu = 0;
	let menu_engage = 0;
	let buffer = 5;
	let button_list = [];
	button_list[0] = 32769;
	button_list[1] = 32770;
	button_list[2] = 32771;
	button_list[3] = 32772;
	button_list[4] = 32773;
	button_list[5] = 32775;
	button_list[6] = 32774;
	button_list[7] = 32776;
	button_list[8] = 32779;
	button_list[9] = 32780;
	button_list[10] = 32777;
	button_list[11] = 32778;
	button_list[12] = -4;
	let r_line = " RESETTED..."
	let o_o = 0;
	let siner = 0;
	let r_buffer = 0;
	let intro = 0;
	let weather = 0;
	let extreme = 0;
	let extreme2 = 0;
	let harp = 0;
	let weathermusic = 0;
	let month = 0;

	if (fun === 1) {
		intro = 1;
		menu_engage = -1;
		weather = 1;
		month = new Date().getMonth() + 1;

		if (month == 12 || month == 1 || month == 2)
			weather = 1;
    
    if (month == 3 || month == 4 || month == 5)
			weather = 2;
    
    if (month == 6 || month == 7 || month == 8)
			weather = 3;
    
    if (month == 9 || month == 10 || month == 11)
			weather = 4;
	}
	
	let finish = 0;

  return {
    name: "settingsmenu", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: null, // sprite object
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
		finish,
		harp,
		weathermusic,
		fun,
		buffer,
		weather,
		extreme,
		extreme2,
		siner,
		menu,
		menu_engage,
		border_enabled,
		num_borders,
		r_buffer,
		r_line,
		month,
		rectile: 0,
		indexsiner: 0,
		intro,
		o_o,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
		step,
		roomEnd,
		draw,
  };
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
  if (this.visible === true) {
    draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      0,
      c_white,
      this.image_alpha
    );
  }
}

function step() {
	if (this.finish) {
		ini_open("config.ini");
		ini_write_string("General", "lang", global.language);
		ini_write_real("General", "sb", global.screen_border_id);
		ini_write_real("joypad1", "b0", global.button0);
    ini_write_real("joypad1", "b1", global.button1);
    ini_write_real("joypad1", "b2", global.button2);
		ini_close();
		caster_free("all");
		room_goto("room_intromenu");
	}
}

function roomEnd() {
	if (this.fun === 1) {
		if (this.harp !== 0)
			caster_free(this.harp);
		
		if (this.weathermusic !== 0)
			caster_free(this.weathermusic)
	}
}

function draw() {
	this.buffer -= 1;

	if (this.fun === 1 && this.harp === 0) {
		this.harp = caster_load(mus_harpnoise);

		if (this.weather === 1) 
			this.weathermusic = caster_load(mus_options_winter);
		
    if (this.weather === 2 || this.weather === 4)
			this.weathermusic = caster_load(mus_options_fall);
    
    if (this.weather === 3)
			this.weathermusic = caster_load(mus_options_summer);
	}

	if (this.weather === 1) {
		this.c = instance_create(0, 0, obj_ct_fallobj);
		this.c.sprite_index = "spr_christmasflake";
		this.siner += 1;
		draw_sprite_ext("spr_tobdog_winter", file_exists, 250, 218, 1, 1, 0, c_white, 1);
		draw_set_color(c_gray);
		draw_text_transformed(220 + Math.sin(this.siner / 12), 120 + Math.cos(this.siner / 12), "cold outside#but stay warm#inside of you", 1, 1, -20)
	}

	if (this.weather === 2) {
		this.c = instance_create(0, 0, obj_ct_fallobj);
		this.c.sprite_index = "spr_fallleaf";
    this.c.image_blend = choose(merge_color(c_red, c_white, 0.5));
		this.siner += 1;
		this.indexsiner += 1;
		let imagenum = 3;
		let index = 0;
		index = Math.floor(this.indexsiner / 15)
		if (index > imagenum) {
			index = 0
			this.indexsiner = 0;
		}
		draw_sprite_ext("spr_tobdog_spring", index, 250, 218, 1, 1, 0, c_white, 1);
		draw_set_color(c_gray);
		draw_text_transformed(220 + Math.sin(this.siner / 12), 120 + Math.cos(this.siner / 12), "spring time#back to school", 1, 1, -20)
	}

	if (this.weather === 3) {
		this.extreme2 += 1;
		if (this.extreme2 >= 240) {
			this.extreme += 1;
			if (this.extreme >= 1100 && Math.abs(Math.sin(this.siner / 15)) < 0.1) {
				this.extreme = 0;
				this.extreme2 = 0;
			}
		}
		this.siner += 1;
		this.indexsiner += 1;
		let imagenum = 1;
		let index = 0;
		index = Math.floor(this.indexsiner / 15)
		if (index > imagenum) {
			index = 0
			this.indexsiner = 0;
		}
		draw_sprite_ext("spr_tobdog_summer", index, 250, 225, 2 + (Math.sin(this.siner / 15) * (0.2 + (this.extreme / 900))), 2 - (Math.sin(this.siner / 15) * (0.2 + (this.extreme / 900))), 0, c_white, 1);
		draw_set_color(c_yellow);
    draw_circle(258 + (Math.cos(this.siner / 18) * 6), 40 + (Math.sin(this.siner / 18) * 6), 28 + (Math.sin(this.siner / 6) * 4), 0);
		draw_set_color(c_gray);
		draw_text_transformed(220 + Math.sin(this.siner / 12), 120 + Math.cos(this.siner / 12), "try to withstand#the sun's life-#giving rays", 1, 1, -20)
	}

	if (this.weather === 4) {
		this.c = instance_create(0, 0, obj_ct_fallobj);
		this.c.sprite_index = "spr_fallleaf";
		this.c.image_blend = choose(c_yellow, c_orange, c_red);
		this.siner += 1;
		draw_sprite_ext("spr_tobdog_autumn", 0, 250, 218, 1, 1, 0, c_white, 1);
		draw_set_color(c_gray);
		draw_text_transformed(220 + Math.sin(this.siner / 12), 120 + Math.cos(this.siner / 12), "sweep a leaf#sweep away a#troubles", 1, 1, -20);
	}

	this.menu_max = 5;

	if (this.menu_engage === 0) {
		if (keyboard_check_pressed(vk_down)) {
			this.menu += 1;
		}

		if (keyboard_check_pressed(vk_up)) {
			this.menu -= 1;
		}

		if (this.menu <= 0) {
			this.menu = 0;
		}

		if (this.menu >= this.menu_max) {
			this.menu = this.menu_max
		}

		if (this.buffer < 0 && control_check_pressed(0)) {
			this.menu_engage = 1;
			this.js_buffer = 1;
			this.buffer = 4;
		}

		if (this.menu === 1) {
			if (this.menu_engage === 1 || keyboard_check_pressed(vk_left) || keyboard_check_pressed(vk_right)) {
				if (global.language === "en") {
					global.language = "ja";
				} else {
					global.language = "en";
				}
			}

			this.menu_engage = 0;
		}

		if (this.menu === 0 && this.menu_engage === 1) {
			this.finish = 1;
		}

		if (this.menu === 3 && this.menu_engage === 1) {
			ini_open("undertale.ini");
			ini_export();
			ini_close();
			ini_open("options.ini");
			ini_export();
			ini_close();
			this.menu_engage = 0;
		}

		if (this.menu === 2 && this.menu_engage === 1) {
			const input = document.createElement("input")
			input.type = "file";
			input.addEventListener("change", (e) => {
				const file = e.target.files[0];
				if (!file) return;

				const reader = new FileReader();

				reader.onload = function () {
					const iniText = reader.result;
					ini_import(iniText, file.name);
					window.location.reload();
				}
				reader.readAsText(file);
			});
			input.click();
		}

		if (this.menu === 5 && this.menu_engage === 1) {
			file_text_export("file0");
			file_text_export("file9");
			this.menu_engage = 0;
		}
		
		if (this.menu === 4 && this.menu_engage === 1) {
			const input = document.createElement("input");
			input.type = "file";
			input.addEventListener("change", (e) => {
				const file = e.target.files[0];
				if (!file) return;

				const reader = new FileReader();

				reader.onload = function() {
					const data = reader.result;
					file_text_import(data, file.name);
					window.location.reload();
				}
				reader.readAsText(file);
			});
			input.click();
		}
	}

	draw_set_color(c_white);
	scr_setfont(fnt_maintext);
	scr_drawtext_centered_scaled(160, 10, "SETTINGS", 2, 2)

	if (this.menu !== 0)
		draw_set_color(c_white)
	else
		draw_set_color(c_yellow)

	draw_text(20, 40, "EXIT");

	if (this.menu != 1)
    draw_set_color(c_white);
	else
		draw_set_color(c_yellow);

	draw_text(20, 70, "LANGUAGE");
	switch (global.language) {
		case "en":
			draw_text(92, 70, "ENGLISH");
			break;
		case "ja":
			draw_text(92, 70, "JAPANESE (not made)");
			break;
		case "":
			global.language = "en";
			break;
	}

	if (this.menu != 2)
    draw_set_color(c_white);
	else
		draw_set_color(c_yellow);

	draw_text(20, 100, "IMPORT .INI");

	if (this.menu != 3)
    draw_set_color(c_white);
	else
		draw_set_color(c_yellow);

	draw_text(20, 130, "EXPORT .INIS");

	if (this.menu != 4)
		draw_set_color(c_white);
	else
		draw_set_color(c_yellow);

	draw_text(20, 160, "IMPORT file0/file9");

	if (this.menu != 5)
		draw_set_color(c_white);
	else
		draw_set_color(c_yellow);

	draw_text(20, 190, "EXPORT file0 & file9");

	if (this.intro === 1) {
		if (this.rectile === 16) {
			caster_play(this.harp, 1, 1);
		}
		this.rectile += 4;
		draw_set_color(c_black);
		draw_rectangle(168 - this.rectile, -10, -1, 250, false);
		draw_set_color(c_black);
		draw_rectangle(152 + this.rectile, -10, 330, 250, false);

		if (this.rectile >= 170) {
			caster_loop(this.weathermusic, 0.8, 1);
			this.menu_engage = 0;
			this.buffer = 5;
			this.intro = -1
		}
	}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, parent, step, roomEnd, draw };
