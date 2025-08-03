import {
  draw_rectangle,
  draw_set_color,
  draw_sprite,
  draw_sprite_ext,
  draw_text,
  instance_exists,
  instances,
  string,
} from "/imports/assets/gamemakerFunctions.js";
import { scr_setfont } from "/imports/customFunctions.js";
import {
  c_black,
  c_red,
  c_white,
  c_yellow,
  fnt_curs,
} from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_rborder from "/obj/rborder/index.js";
import * as obj_uborder from "/obj/uborder/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  global.inbattle = 1;
  global.flag[201] = global.kills;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/fastbattle/"
  ) {
    global.border = 1;
  }

  return {
    name: "floweydraw", // sprite name
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

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
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

function draw() {
  if (instance_exists(obj_uborder)) {
    this.depth = 5;
    draw_set_color(c_black);
    let uborder = instances.get(obj_uborder)[0];
    let rborder = instances.get(obj_rborder)[0];
    let dborder = instances.get(obj_dborder)[0];
    draw_rectangle(uborder.x + 5, uborder.y + 5, rborder.x, dborder.y);
  }
  draw_sprite("spr_hpname", 0, 270, 400);
  draw_set_color(c_red);
  draw_rectangle(310, 400, 310 + global.maxhp * 1.2, 420, false);
  draw_set_color(c_yellow);
  draw_rectangle(310, 400, 310 + global.hp * 1.2, 420, false);
  draw_set_color(c_white);
  scr_setfont(fnt_curs);
  let hpwrite = string(global.hp);

  if (global.hp < 10) {
    hpwrite = "0" + string(global.hp);
  }

  draw_text(200, 400, "LV " + string(global.lv));
  draw_text(
    330 + global.maxhp * 1.2,
    400,
    hpwrite + " / " + string(global.maxhp)
  );
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  draw,
};
