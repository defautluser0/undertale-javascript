import {
  draw_sprite_ext,
  instance_number,
  instance_destroy,
  action_move,
  move_towards_point,
  instances,
  random,
  getBoundingBox,
  collision_rectangle,
  instance_create,
  instance_exists,
  _with,
} from "/imports/assets/gamemakerFunctions.js";
import { c_white, snd_hurt1 } from "/imports/assets.js";
import { snd_play } from "/imports/customFunctions.js";
import global from "/imports/assets/global.js";

import * as obj_fakeheart from "/obj/fakeheart/index.js";
import * as obj_floweybattle1 from "/obj/floweybattle1/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";
import * as obj_blconwdflowey from "/obj/blconwdflowey/index.js";
import * as obj_shaker from "/obj/shaker/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  alarm[0] = 35;

  return {
    name: "friendlypellet", // sprite name
    depth: 20, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.5, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_index: "spr_spinbullet", // sprite object
    direction: 30,
    friction: 0,
    gravity: 0,
    gravitydirection: 270,
    speed: 4,
    hspeed: 0,
    vspeed: 0,
    visible: true, // sprite visibility
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    attackratio: 0,
    attackyou: 0,
    blonicx: 0,
    blonicy: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    updateCol,
    roomStart,
    alarm0,
    step,
    outsideRoom,
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

  if (this.friction !== 0) {
    if (this.speed > 0) {
      this.speed -= this.friction;
      if (this.speed < 0) this.speed = 0;
    }
  }
  getBoundingBox.call(this);

  const dirRad = -(this.direction * Math.PI) / 180;
  this.hspeed = Math.cos(dirRad) * this.speed;
  this.vspeed = Math.sin(dirRad) * this.speed;

  // Update position
  this.x += this.hspeed;
  this.y += this.vspeed;
  this.updateCol();
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

function roomStart() {
  this.direction = instance_number(this._object) * 30;
}

function alarm0() {
  action_move.call(this, "000010000", 0);
  this.blonicx = this.x;
  this.blonicy = this.y;
}

function step() {
  const fakeheart = instances.get(obj_fakeheart)[0];
  if (this.attackyou === 1) {
    this.attackratio += 1;
    move_towards_point.call(
      this,
      fakeheart.x,
      fakeheart.y,
      0.1 * this.attackratio * this.attackratio * this.attackratio + random(0.5)
    );
    this.direction += random(4) - random(2);
    this.depth = -500;
    this.attackyou = 2;
    this.friction = -0.04 * this.attackratio;
  }

  if (this.attackyou === 3) {
    instance_destroy(this);
  }
}

function updateCol() {
  let other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_fakeheart,
    false,
    false
  );
  if (other) {
    if (global.invc < 1) {
      global.hp -= 19;
      snd_play(snd_hurt1);
      global.hshake = 8;
      global.shakespeed = 1.5;
      global.vshake = 2;
      instance_create(0, 0, obj_shaker);
      global.invc = 30;

      _with(obj_floweybattle1, function () {
        this.conversation = 10;
      });

      _with(this._object, function () {
        this.attackyou = 3;
      });

      if (instance_exists(OBJ_WRITER)) {
        _with(OBJ_WRITER, function () {
          instance_destroy(this);
        });
      }

      if (instance_exists(obj_blconwdflowey)) {
        _with(obj_blconwdflowey, function () {
          instance_destroy(this);
        });
      }
    }
  }
}

function outsideRoom() {
  const floweybattle1 = instances.get(obj_floweybattle1)[0];
  if (this.attackyou !== 3) {
    if (floweybattle1.conversation === 3) {
      floweybattle1.conversation = 5;
    }
    if (floweybattle1.conversation === 8) {
      floweybattle1.conversation = 9;
    }
    if (floweybattle1.conversation === 9.4) {
      floweybattle1.conversation = 9.5;
    }
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  alarm0,
  step,
  updateCol,
  outsideRoom,
};
