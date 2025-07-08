import { spr_tobdogl, spr_tobdog_sleep_trash, mus_dance_of_dog, mus_sigh_of_dog, c_white } from "/imports/assets.js"
import { floor, random, draw_sprite_ext } from "/imports/assets/gamemakerFunctions.js"
import { caster_free, caster_load, caster_loop } from "/imports/customFunctions.js"
import roomSize from "/imports/assets/roomSize.js"

function create() {
	const alarm = new Array(12).fill(-1);

	alarm[0] = 5;

	return {
		name: "roomofdog",
		depth: 0,
		image_xscale: 1,
		image_yscale: 1,
		x: 0,
		oldx: 0,
		y: 0,
		oldy: 0,
		image_alpha: 1,
		image_index: 0,
		image_speed: 0,
		image_number: 2,
		sprite_index: spr_tobdogl,
		visible: true,

		alarm: alarm,

		alarm0,
		updateAlarms,
		updateGamemakerFunctions,
		updateSprite,
	}
}

function alarm0() {
	caster_free("all");
	this.visible = true;
	let type = floor(random(8));
	this.image_xscale = 2;
	this.image_yscale = 2;

	if (type === 7) {
		this.x = roomSize.width / 2;
		this.oldx = roomSize.width / 2;
		this.y = roomSize.height / 2;
		this.oldy = roomSize.height / 2;
		this.sprite_index = spr_tobdog_sleep_trash;
		let thissong = caster_load(mus_sigh_of_dog);
		caster_loop(thissong, 1, 0.8 + random(0.2));
		this.image_speed = 0.05
	} else {
		this.x = roomSize.width / 2 - this.sprite_index.width / 2;
		this.oldx = roomSize.width / 2 - this.sprite_index.width / 2;
		this.y = roomSize.height / 2 - this.sprite_index.height / 2;
		this.oldy = roomSize.height / 2 - this.sprite_index.height / 2;
		let thissong = caster_load(mus_dance_of_dog);
		caster_loop(thissong, 1, 0.95 + random(0.1));
		this.image_speed = 0.15;
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
	this.x = this.oldx;
	this.y = this.oldy
	if (Math.floor(this.image_index) === 1 && this.sprite_index !== spr_tobdog_sleep_trash) {
		this.oldx = this.x;
		this.x += 2;
	}
	if (Math.floor(this.image_index) === 1 && this.sprite_index === spr_tobdog_sleep_trash) {
		this.oldx = this.x;
		this.oldy = this.y
		this.x -= 1;
		this.y += 1;
	}
	draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale, 0, c_white, this.image_alpha)
}

export { create, alarm0, updateAlarms, updateGamemakerFunctions, updateSprite }