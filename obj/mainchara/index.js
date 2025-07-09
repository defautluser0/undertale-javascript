import { draw_sprite_ext, merge_color, instance_exists, round, keyboard_check, draw_sprite, draw_sprite_part_ext } from "/imports/assets/gamemakerFunctions.js";
import { c_white, c_gray, c_black } from "/imports/assets.js";
import global from "/imports/assets/global.js";
import { scr_hardmodename, snd_play } from "/imports/customFunctions.js"
import { view_xview, view_yview, view_wview, view_hview } from "/imports/view.js"
import * as obj_shaker from "/obj/shaker/index.js"
import * as obj_markerB from "/obj/markerB/index.js"
import { control_check_pressed, control_clear } from "/imports/input.js"

function create() {
	const alarm = new Array(12).fill(-1);

	// create code
	if (global.flag[7] === 1) {
		if (global.flag[287] <= global.flag[286]) {
			global.flag[287] = global.flag[286] + 1;
		}
	}

	if (global.flag[6] === 1 && !scr_hardmodename(global.charname)) {
		global.flag[6] = 0;
	}

	global.flag[462] = 0;

	global.phasing = 0;

	global.currentroom = `${window.location.href.slice(35,39)}_${window.location.href.slice(40).split("/")[0]}`;

	let dsprite = "";
	let rsprite = "";
	let usprite = "";
	let lsprite = "";

	dsprite = "spr_maincharad";
	rsprite = "spr_maincharar";
	usprite = "spr_maincharau";
	lsprite = "spr_maincharal";

	if (global.flag[85] == 1) {
			dsprite = "spr_maincharad_umbrella";
			rsprite = "spr_maincharar_umbrella";
			usprite = "spr_maincharau_umbrella";
			lsprite = "spr_maincharal_umbrella";
	}

	return {
		name: "mainchara", // sprite name
		depth: 0, // object depth
		image_xscale: 1, // sprite scale
		image_yscale: 1, // sprite scale
		x: 0, // object x. this is set by room
		y: 0, // object y. this is set by room
		previousx: 0,
		xprevious: 0,
		yprevious: 0,
		previousy: 0,
		image_alpha: 1, // sprite alpha
		image_index: 0, // sprite frame index
		image_speed: 0, // sprite frame speed
		image_number_lr: 2, // sprite frame number
		image_number_ud: 4,
		sprite_index: "spr_maincharad", // sprite object
		visible: true, // sprite visibility
		sprite_height: 0,
		sprite_width: 0,
		image_blend: c_white,

		alarm: alarm, // alarm array

		img: 0,

		// any variables assigned inside create code
		lastfacing: 0,
		nnn: 0,
		cutscene: 0,
		facing: global.facing,
		moving: 0,
		movement: 1,
		dsprite,
		usprite,
		lsprite,
		rsprite,
		inwater: 0,
		h_skip: 0,
		uncan: 0,
		m_override: 0,

		// object functions. add to here if you want them to be accessible from this. context
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
		roomStart,
		endStep,
		step,
		user0,
		user2,
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
	if (this.image_index >= this.image_number_lr && (this.sprite_index === "spr_maincharal" || this.sprite_index === "spr_maincharar")) {
		this.image_index -= this.image_number_lr;
	}
	if (this.image_index >= this.image_number_ud && (this.sprite_index === "spr_maincharad" || this.sprite_index === "spr_maincharau")) {
		this.image_index -= this.image_number_ud;
	}
	this.previousx = this.x;
	this.xprevious = this.x;
	this.previousy = this.y;
	this.yprevious = this.y;
}

function updateSprite() {
	if (this.inwater == 0)
    this.img = draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, this.image_blend, this.image_alpha, 1);
		if (this.img) {
			this.sprite_height = this.img.height;
			this.sprite_width = this.img.width;
		}
	if (this.inwater == 1)
	{
			draw_sprite_part_ext(this.sprite_index, this.image_index, 0, 0, this.sprite_width, this.sprite_height - 5, this.x, this.y + 5, 1, 1, c_white, this.image_alpha);
			
			if (this.image_index == 1 || this.image_index == 3)
			{
					snd_play("snd_splash");
					this.mp = 0;
			}
			
			draw_sprite("spr_waterripple", 0, this.x, this.y);
	}

	if (global.currentroom === "room_water_waterfall3")
			draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, 1, 1, 0, c_black, this.image_alpha);
	
}

function roomStart() {
	if (this.x % 3 === 2) {
		this.x += 1;
	}

	if (this.x % 3 === 1) {
		this.x -= 1;
	}

	if (this.y % 3 === 2) {
		this.y += 1;
	}

	if (this.y % 3 === 1) {
		this.y -= 1;
	}

	if (global.interact == 3)
	{
		if (global.entrance > 0)
		{
			global.interact = 0;
			
			if (global.entrance == 1)
			{
					this.x = obj_markerA.x;
					this.y = obj_markerA.y;
			}
			
			if (global.entrance == 2)
			{
					this.x = obj_markerB.x;
					this.y = obj_markerB.y;
			}
			
			if (global.entrance == 4)
			{
					this.x = obj_markerC.x;
					this.y = obj_markerC.y;
			}
			
			if (global.entrance == 5)
			{
					this.x = obj_markerD.x;
					this.y = obj_markerD.y;
			}
			
			if (global.entrance == 18)
			{
					this.x = obj_markerr.x;
					this.y = obj_markerr.y;
			}
			
			if (global.entrance == 19)
			{
					this.x = obj_markers.x;
					this.y = obj_markers.y;
			}
			
			if (global.entrance == 20)
			{
					this.x = obj_markert.x;
					this.y = obj_markert.y;
			}
			
			if (global.entrance == 21)
			{
					this.x = obj_markeru.x;
					this.y = obj_markeru.y;
			}
			
			if (global.entrance == 22)
			{
					this.x = obj_markerv.x;
					this.y = obj_markerv.y;
			}
			
			if (global.entrance == 23)
			{
					this.x = obj_markerw.x;
					this.y = obj_markerw.y;
			}
			
			if (global.entrance == 24)
			{
					this.x = obj_markerX.x;
					this.y = obj_markerX.y;
			}
		}
	}
	
	if (global.facing === 0)
    this.sprite_index = this.dsprite;

	if (global.facing === 1)
		this.sprite_index = this.rsprite;

	if (global.facing === 2)
		this.sprite_index = this.usprite;

	if (global.facing === 3)
		this.sprite_index = this.lsprite;

	if (global.flag[480] === 1) {
    this.image_blend = merge_color(c_gray, c_white, 0.3);
	}

	this.depth = 50000 - ((this.y * 10) + (this.sprite_height * 10));
}

function endStep() {
	if (global.left === false) {
		if (global.right === false) {
			if (global.down === false) {
				if (global.up === false) {
					this.moving = 0;
				}
			}
		}
	}

	if (global.interact > 0) {
		this.moving = 0;
		this.movement = 0;
	} else {
		this.movement = 1;
	}

	if (Math.abs(this.xprevious - this.x) > 0.01 || Math.abs(this.previousy - this.y) > 0.01) {
		this.moving = 1;
	}
	if (this.moving == 0)
	{
    this.image_speed = 0;
    this.image_index = 0;
	}

	if (global.interact === 0) {
		if (this.moving === 1) {
			global.encounter += 1;
		}
	}
	if (this.cutscene === 0) {
		if (instance_exists(obj_shaker)) {
			view_xview[0] = round((this.x - (view_wview[0] / 2)) + 10);
			view_yview[0] = round((this.y - (view_hview[0] / 2)) + 10);
		}
	}
}

function step() {
	if (global.facing == 0)
    this.sprite_index = this.dsprite;

	if (global.facing == 1)
		this.sprite_index = this.rsprite;

	if (global.facing == 2)
		this.sprite_index = this.usprite;

	if (global.facing == 3)
		this.sprite_index = this.lsprite;

	if (global.inbattle == 1)
	{
		if (global.flag[15] == 0)
		{
			instance_create(0, 0, obj_musfadein);	
			caster_resume(global.currentsong);
		}

		global.inbattle = 0;
			
		if (global.specialbattle == 0)
			global.interact = 0;
			
		this.depth = 100;
			
		if (global.flag[200] != 0)
		{
			if (global.flag[201] != global.kills)
					global.flag[global.flag[200]] += global.kills - global.flag[201];
		}
	}

	if (global.left)
	{
			if (this.movement == 1)
			{
					this.turned = 1;
					
					if (this.xprevious == (this.x + 3))
							this.x -= 2;
					else
							this.x -= 3;
					
					if (this.moving != 1)
							this.image_index = 1;
					
					this.moving = 1;
					
					if (global.debug == 1)
					{
							if (keyboard_check("Backspace"))
									this.x -= 5;
					}
					
					this.image_speed = 0.2;
					
					if (global.up && global.facing == 2)
							this.turned = 0;
					
					if (global.down && global.facing == 0)
							this.turned = 0;
					
					if (this.turned == 1)
							global.facing = 3;
			}
	}

	if (global.up)
	{
			if (this.movement == 1)
			{
					this.turned = 1;
					this.y -= 3;
					
					if (global.debug == 1)
					{
							if (keyboard_check("Backspace"))
									y -= 5;
					}
					
					if (this.moving != 1)
							this.image_index = 1;
					
					this.moving = 1;
					this.image_speed = 0.2;
					
					if (global.right && global.facing == 1)
							this.turned = 0;
					
					if (global.left && global.facing == 3)
							this.turned = 0;
					
					if (this.turned == 1)
							global.facing = 2;
			}
	}

	if (global.right)
	{
			if (this.movement == 1)
			{
					if (global.left == 0)
					{
							this.turned = 1;
							
							if (this.xprevious == (this.x - 3))
									this.x += 2;
							else
									this.x += 3;
							
							if (global.debug == 1)
							{
									if (keyboard_check("Backspace"))
											this.x += 5;
							}
							
							this.moving = 1;
							this.image_speed = 0.2;
							
							if (this.moving != 1)
									this.image_index = 1;
							
							if (global.up && global.facing == 2)
									this.turned = 0;
							
							if (global.down && global.facing == 0)
									this.turned = 0;
							
							if (this.turned == 1)
									global.facing = 1;
					}
			}
	}

	if (global.down)
	{
			if (this.movement == 1)
			{
					if (global.up == 0)
					{
							this.turned = 1;
							this.y += 3;
							
							if (global.debug == 1)
							{
									if (keyboard_check("Backspace"))
											this.y += 5;
							}
							
							if (this.moving != 1)
									this.image_index = 1;
							
							this.moving = 1;
							this.image_speed = 0.2;
							
							if (global.right && global.facing == 1)
									this.turned = 0;
							
							if (global.left && global.facing == 3)
									this.turned = 0;
							
							if (this.turned == 1)
									global.facing = 0;
					}
			}
	}
	
	if (control_check_pressed(0))
			this.user0();

	if (control_check_pressed(2))
			this.user2();

	if (instance_exists("obj_battler") === false)
	{
			this.depth = 50000 - ((this.y * 10) + (this.sprite_height * 10));
			
			if (global.flag[85] == 1 && dsprite == spr_maincharad_umbrella)
					depth = 50000 - ((y * 10) + 300);
	}
}

function user0() {
		if (global.interact == 0 && this.uncan == 0)
		{
				if (instance_exists(obj_itemswapper) == 0)
				{
						if (global.facing == 1)
						{
								if (collision_rectangle(x + (sprite_width / 2), y + 19, x + sprite_width + 15, y + sprite_height, obj_interactable, 0, 1))
								{
										interactedobject = collision_rectangle(x + (sprite_width / 2), y + (sprite_height / 2), x + sprite_width + 15, y + sprite_height, obj_interactable, 0, 1);
										
										if (interactedobject != -4)
										{
												interactedobject.facing = 3;
												
												script_execute.call(interactedobject, scr_interact);
										}
								}
						}
						
						if (global.facing == 3)
						{
								if (collision_rectangle(x + (sprite_width / 2), y + 19, x - 15, y + sprite_height, obj_interactable, 0, 1))
								{
										interactedobject = collision_rectangle(x + (sprite_width / 2), y + 3 + (sprite_height / 2), x - 15, y + sprite_height + 3, obj_interactable, 0, 1);
										
										if (interactedobject != -4)
										{
												interactedobject.facing = 1;
												
												script_execute(interactedobject, scr_interact);
										}
								}
						}
						
						if (global.facing == 0)
						{
								if (collision_rectangle(x + 4, y + 20, (x + sprite_width) - 4, y + sprite_height + 15, obj_interactable, 0, 1))
								{
										interactedobject = collision_rectangle(x + 4, y + 20, (x + sprite_width) - 4, y + sprite_height + 15, obj_interactable, 0, 1);
										
										if (interactedobject != -4)
										{
												interactedobject.facing = 2;
												
												script_execute.call(interactedobject, scr_interact);
										}
								}
						}
						
						if (global.facing == 2)
						{
								if (collision_rectangle(x + 4, (y + sprite_height) - 5, (x + sprite_width) - 4, y + 5, obj_interactable, 0, 1))
								{
										interactedobject = collision_rectangle(x + 4, (y + sprite_height) - 5, (x + sprite_width) - 4, y + 8, obj_interactable, 0, 1);
										
										if (interactedobject != -4)
										{
												interactedobject.facing = 0;
												
												script_execute.call(interactedobject, scr_interact);
										}
								}
						}
				}
		}
}

function user2() {
		if (global.interact == 0 && global.flag[17] == 0)
		{
				snd_play("snd_squeak");
				global.interact = 5;
				global.menuno = 0;
				control_clear(2);
		}
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, roomStart, endStep, step, user0, user2 };