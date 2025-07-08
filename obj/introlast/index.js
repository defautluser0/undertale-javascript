import { draw_sprite_part } from "/imports/assets/gamemakerFunctions.js"

function create() {
	const alarm = new Array(12).fill(-1);

	alarm[0] = 150;
	alarm[2] = 20;
	
	return {
		sprite_index: "spr_introlast",
		image_index: 0,
		image_speed: 0,
		sprite_height: 320,
		sprite_width: 350,
		visible: false,

		h: 10,
		go: 0,
		alarm: alarm,

		alarm2,
		alarm0,
		draw,
		updateGamemakerFunctions,
		updateAlarms,
	}
}

function draw() {
	draw_sprite_part(this.sprite_index, this.image_index, 0, this.sprite_height - (this.h + 100), 320, this.sprite_height - this.h, 0, 30);

	if (this.go  === 1) {
		this.h += 1;
	}

	if (this.h > 240) {
		this.h -= 1;
	}
}

function alarm2() {
	this.visible = true;
}

function alarm0() {
	this.go = 1;
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

export { create, alarm2, alarm0, draw, updateAlarms, updateGamemakerFunctions };