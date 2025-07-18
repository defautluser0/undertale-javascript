import {
  caster_load,
  caster_play,
  caster_stop,
  caster_free,
  caster_set_volume,
} from "/imports/customFunctions.js";
import { mus_story } from "/imports/assets.js";
import {
  instance_create,
  instance_destroy,
  instance_exists,
  draw_sprite_ext,
  room_goto,
} from "/imports/assets/gamemakerFunctions.js";
import global from "/imports/assets/global.js";
import { ogCanvas, ogCtx, canvas, ctx } from "/imports/canvasSetup.js"
import { view_current, view_hview, view_wview, view_xview, view_yview } from "/imports/view.js"
import { control_check_pressed } from "/imports/input.js";
import roomSize from "/imports/assets/roomSize.js";
import * as OBJ_WRITER from '/obj/writer/index.js';
import * as obj_introfader from '/obj/introfader/index.js';
import * as obj_unfader from '/obj/unfader/index.js';
import * as obj_introlast from '/obj/introlast/index.js';

// create
function create() {
  const alarm = new Array(12).fill(-1);
  alarm[2] = 4;
  return {
    name: "introimage",
    sprite_index: "spr_introimage",
    image_index: 0,
    image_speed: 0,
    image_number: 11,
    image_xscale: 1,
    image_yscale: 1,
    visible: true,
    x: 0,
    y: 0,
    depth: 0,

    alarm: alarm,

    mywriter: null,
    fader: null,

    act: 0,
    skip: 0,
    fadercreator: undefined,
    vol: undefined,
    dongs: undefined,

    intromusic: caster_load(mus_story),
    updateGamemakerFunctions,
    updateAlarms,
    beginStep,
    step,
    alarm0,
    alarm1,
    alarm2,
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

// alarm and image_index
function updateGamemakerFunctions() {
  ogCtx.clearRect(0, 0, ogCanvas.width, ogCanvas.height);
  ogCtx.drawImage(
    canvas,
    view_xview[view_current],
    view_yview[view_current],
    roomSize.width,
    roomSize.height,
    0,
    0,
    view_wview[view_current],
    view_hview[view_current],
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }

  draw_sprite_ext(this.sprite_index, this.image_index, this.x, this.y, this.image_xscale, this.image_yscale);
}

function alarm2() {
  this.act = 1;
  this.dongs = 0;
  this.image_speed = 0;
  this.vol = 1;
  caster_play(this.intromusic, 1, 0.91);
  global.typer = 11;
  global.faceemotion = 0;
  global.msc = 0;
  this.fadercreator = 0;
  this.skip = 0;

  global.msg[0] = " Long ago^1, two races&ruled over Earth^1:&HUMANS and MONSTERS^6. \\E1 ^1 %";
  global.msg[1] = " One day^1, war broke&out between the two&races^6. \\E0 ^1 %";
  global.msg[2] = " After a long battle^1,&the humans were&victorious^6. \\E1 ^1 %";
  global.msg[3] = " They sealed the monsters&underground with a magic&spell^6. \\E0 ^1 %";
  global.msg[4] = " Many years later^2.^2.^5.  \\E1 ^1 %";
  global.msg[5] = "       MT. EBOTT&         201X^9 \\E0 %";
  global.msg[6] = " Legends say that those&who climb the mountain&never return^5.^3 \\E1 %";
  global.msg[7] = "  \\E1 %";
  global.msg[8] = "  ^9 ^5 \\E0 %";
  global.msg[9] = "  ^9 ^5 ^2 \\E1 %";
  global.msg[10] = "  ^9 ^5 ^2 \\E2 %";
  global.msg[11] = "  ^9 ^9 ^9 ^9 ^9 ^9 \\E2 %%";
  global.msg[12] = "  ^9 ^9 ^9 ^9 ^9  \\E0 %%";
  global.msg[13] = "  ^9 ^9 ^9 ^9 ^9 ^9 \\E0 %";
  global.msg[14] = "  %%";

  this.mywriter = instance_create(40, 140, OBJ_WRITER);
  this.alarm[0] = 5;
}

function alarm1() {
  caster_stop(this.intromusic);
  caster_free(this.intromusic);
  room_goto("room_introimage");
}

function alarm0() {
  if (this.fadercreator !== global.faceemotion) {
    instance_create(0, 0, obj_introfader);
  }
  this.alarm[0] = 3;
  this.fadercreator = global.faceemotion;
}


/**
 * Called every frame in the Begin Step event
 */
function beginStep() {
  if (this.act === 1) {
    if (!instance_exists(OBJ_WRITER) && this.skip === 0) {
      this.skip = 1;
      this.fader = instance_create(0, 0, obj_unfader);
      this.fader.tspeed = 0.05;
      this.alarm[1] = 30;
    }

    if (this.skip === 1) {
      this.vol -= 0.05;
      caster_set_volume(this.intromusic, this.vol);
    }

    if (global.faceemotion === 2 && this.dongs === 0) {
      this.dongs = 1;
      instance_create(this.x, this.y, obj_introlast);
    }
  }
}

/**
 * Called every frame in the Step event
 */
function step() {
  if (this.act === 1) {
    if (control_check_pressed(0)) {
      if (this.skip === 0) {
        this.skip = 1;
        this.fader = instance_create(0, 0, obj_unfader);
        this.fader.tspeed = 0.05;
        this.alarm[1] = 30;
        instance_destroy(this.mywriter);
      }
    }
  }
}

export {
  create,
  updateAlarms,
  alarm0,
  alarm1,
  alarm2,
  updateGamemakerFunctions,
  beginStep,
  step,
};
