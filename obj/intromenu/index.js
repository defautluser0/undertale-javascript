import global from "/imports/assets/global.js";
import { caster_loop, scr_namingscreen_setup, scr_namingscreen_check, scr_drawtext_centered, scr_setfont, scr_namingscreen } from "/imports/customFunctions.js";
import { mus_menu0, mus_menu1, mus_menu2, mus_menu3, mus_menu4, mus_menu5, mus_menu6, c_white, c_gray, fnt_small } from "/imports/assets.js"
import { draw_sprite_ext, draw_sprite, draw_background, draw_set_color, script_execute, ini_read_string, ini_read_real, ini_open, ini_close, file_exists } from "/imports/assets/gamemakerFunctions.js";

function create() {
	const alarm = new Array(12).fill(-1);

	// create code
	ini_open("undertale.ini")
	let name = ini_read_string("General", "Name", "");
	let love = ini_read_real("General", "Love", 0);
	let time = ini_read_real("General", "Time", 0);
	let kills = ini_read_real("General", "Kills", 0);
	let roome = ini_read_real("General", "Room", 0);
	ini_close()
	let hasname = 0;
	if (name !== "") {
		hasname = 1;
	}
	if (hasname === 1) {
		global.charname = name;
	}
	let menusong = 0;
	if (name !== "") {
		hasname = 1;
	}
	if (hasname === 1) {
		global.charname = name;
	}

	ini_open("undertale.ini")
	const m2 = file_exists("file0");
	const m3 = ini_read_real("Toriel", "TK", 0);
	const m4 = ini_read_real("Toriel", "TS", 0);
	const pd = ini_read_real("Papyrus", "PD", 0);
	const ud = ini_read_real("Undyne", "UD", 0);
	const ad = ini_read_real("Alphys", "AD", 0);
	const fd = ini_read_real("F7", "F7", 0);
	const fk = ini_read_real("Flowey", "K", 0);
	const truereset = ini_read_real("EndF", "EndF", 0);
	ini_close()
	let mlevel = 0;

	if (m2 === true) {
		if (m3 > 0) {
			mlevel = 1;
		}
		if (m4 > 0) {
			mlevel = 2;
		}
		if (pd > 0 && mlevel === 2) {
			mlevel = 3;
		}
		if (ud > 0 && mlevel === 3) {
			mlevel = 4;
		}
		if (ad > 0 && mlevel === 4) {
			mlevel = 5;
		}
		if (fd > 0 && mlevel === 5) {
			mlevel = 6;
		}
	}

	if (truereset > 0) {
		mlevel = 7;
	}

	switch (mlevel) {
		case 0:
			menusong = mus_menu0;
			break;

		case 1:
			menusong = mus_menu1;
			break;

		case 2:
			menusong = mus_menu2;
			break;
		
		case 3:
			menusong = mus_menu3;
			break;

		case 4:
			menusong = mus_menu4;
			break;

		case 5:
			menusong = mus_menu5;
			break;
		
		case 6:
			menusong = mus_menu6;
			break;

		case 7:
			menusong = mus_menu0;
			break;
	}

	if (mlevel >= 0 && mlevel <= 6) {
		caster_loop(menusong, 0.6, 1);
	}

	if (mlevel === 7) {
		caster_loop(menusong, 0.1, 0.1);
	}

	const namingscreen_setup = scr_namingscreen_setup(truereset)

	return {
		objName: "intromenu", // sprite name
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

		alarm: alarm, // alarm array

		// any variables assigned inside create code
		siner_o: 0,
		selected: 65,
		charname: "",
		naming: 3,
		selected2: 0,
		selected3: 0,
		q: 0,
		name,
		hasname,
		mlevel,
		m2,
		m3,
		m4,
		pd,
		ud,
		ad,
		fd,
		fk,
		truereset,
		love,
		time,
		kills,
		roome,

		// scr_namingscreen_setup
		ascii_rows: namingscreen_setup.ascii_rows,
    ascii_cols: namingscreen_setup.ascii_cols,
    ascii_x: namingscreen_setup.ascii_x,
    ascii_y: namingscreen_setup.ascii_y,
    ascii_charmap: namingscreen_setup.ascii_charmap,

    selected_charmap: namingscreen_setup.ascii_charmap,
    selected_row: namingscreen_setup.selected_row,
    selected_col: namingscreen_setup.selected_col,
    selected3: namingscreen_setup.selected3,

    title_y: namingscreen_setup.title_y,
    name_y: namingscreen_setup.name_y,
    charset_y: namingscreen_setup.charset_y,
    menu_y: namingscreen_setup.menu_y,
    name_x: namingscreen_setup.name_x,
    menu_x0: namingscreen_setup.menu_x0,
    menu_x1: namingscreen_setup.menu_x1,
    menu_x2: namingscreen_setup.menu_x2,
    continue_x: namingscreen_setup.continue_x,
    reset_x: namingscreen_setup.reset_x,

		namingscreen_setup,

		// any variables needed for scripts
		allow: 1,
		spec_m: "Is this name correct?",
		selected2: 0,
		alerm: 0,
		shayy: 0,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		step,
		draw,
	}
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
	this.image_index = this.image_index;
	if (this.image_index >= this.image_number) {
		this.image_index -= this.image_number;
	}
}

function updateSprite() {
	draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha)
}

function step() {
	if (this.naming === 1 || this.naming === 2) {
		const namingcheck = scr_namingscreen_check(this.charname);
		this.allow = namingcheck.allow;
		this.spec_m = namingcheck.spec_m;
	}
}

function draw() {
	this.siner_o += 1;

	if (this.naming === 3) {
		if (this.mlevel > 0) {
			draw_background("bg_floweyglow", 0, -120);
		}
    
    if (this.mlevel == 1) {
			if (this.fk == 0)
				draw_sprite("spr_flowey", 0, 147, 169);
    }
    
    if (this.mlevel == 2) {
			draw_sprite("spr_chairiel", 0, 125, 138);
		}
    
    if (this.mlevel == 3) {
			draw_sprite("spr_chairiel_sleep", siner_o / 8, 125, 138);
			draw_sprite("spr_papyrus_d_darkbg", 0, 241, 151);
			draw_sprite("spr_sans_shrug1_dark", 0, 271, 164);
    }
    
    if (this.mlevel == 4) {        
			draw_sprite("spr_chairiel_sleep", siner_o / 8, 125, 138);
			draw_sprite("spr_papyrus_cape_dark", 0, 243, 151);
			draw_sprite("spr_undyne_youremine_dark", 0, 243 - 3, 103);
			draw_sprite("spr_sans_shrug1_dark", 0, 63, 33);
    }
    
    if (this.mlevel == 5) {
			draw_sprite("spr_chairiel_sleep", siner_o / 8, 125, 138);
			draw_sprite("spr_alphys_d_dark", 0, 270, 167);
			draw_sprite("spr_papyrus_cape_dark", 0, 272, 132);
			draw_sprite("spr_undyne_youremine_dark", 0, 269, 84);
			draw_sprite("spr_out_to_lunch_sign", 0, 20, 169);
    }
    
    if (this.mlevel == 6) {
			draw_sprite("spr_toriel_d_dark", 0, 143, 138);
			draw_sprite("spr_papyrus_d_darkbg", 0, 119, 147);
			draw_sprite("spr_sans_d_dark", 0, 172, 161);
			draw_sprite("spr_undyne_d_dark", 0, 99, 136);
			draw_sprite("spr_alphys_d_dark2", 0, 74, 158);
			draw_sprite("spr_asgore_d_dark", 0, 195, 130);
			draw_sprite("spr_napstablook_d", 0, 9, 157);
			draw_sprite("spr_mettex_dark", 0, 28, 139);
			draw_sprite("spr_mkid_d_dark", 0, 262, 162);
    }
	}

	script_execute.call(this, scr_namingscreen);

	if (this.naming === 3) {
		const version = "1.08";

		draw_set_color(c_gray);
		scr_setfont(fnt_small, 1);
		scr_drawtext_centered(160, 224, "UNDERTALE v"+ version+ " (C) Toby Fox 2015-2017", 1)
		scr_drawtext_centered(160, 232, "JS port made by defautluser0", 1)
	}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, step, draw };