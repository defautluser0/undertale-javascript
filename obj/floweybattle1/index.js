import {
  _with,
  draw_sprite_ext,
  getBoundingBox,
  instance_create,
  instance_destroy,
  instance_exists,
  instance_find,
  instances,
} from "/imports/assets/gamemakerFunctions.js";
import {
  caster_free,
  caster_set_pitch,
  caster_set_volume,
  caster_stop,
  SCR_BORDERSETUP,
  scr_gettext,
  scr_textskip,
  snd_play,
  snd_stop,
} from "/imports/customFunctions.js";
import { c_white, snd_floweylaugh, snd_power } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_blconwdflowey from "/obj/blconwdflowey/index.js";
import * as obj_dborder from "/obj/dborder/index.js";
import * as obj_fakeheart from "/obj/fakeheart/index.js";
import * as obj_fakepellet from "/obj/fakepellet/index.js";
import * as obj_friendlypellet from "/obj/friendlypellet/index.js";
import * as obj_guidearrows from "/obj/guidearrows/index.js";
import * as OBJ_INSTAWRITER from "/obj/instawriter/index.js";
import * as obj_lborder from "/obj/lborder/index.js";
import * as obj_radialfakegen from "/obj/radialfakegen/index.js";
import * as obj_rborder from "/obj/rborder/index.js";
import * as obj_shaker from "/obj/shaker/index.js";
import * as obj_torielcutscene from "/obj/torielcutscene/index.js";
import * as obj_torielflame_X from "/obj/torielflame_X/index.js";
import * as obj_uborder from "/obj/uborder/index.js";
import * as obj_winkstar from "/obj/winkstar/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";

const parent = null; // change as neccesary. if no parent, replace this line with "const parent = null;"

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  let floweysong = global.currentsong;
  global.inbattle = 1;
  global.border = 3;
  let conversation = 0;
  alarm[0] = 10;
  global.faceemotion = 0;
  SCR_BORDERSETUP(0, 0, 0, 0, 0);

  return {
    name: "floweybattle1", // sprite name
    depth: 0, // object depth
    image_xscale: 2, // sprite scale
    image_yscale: 2, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_index: "spr_floweynice", // sprite object
    sprite_width: 42, // placeholder
    sprite_height: 44, // placeholder
    bbox_left: 0, // placeholder
    bbox_right: 0, // placeholder
    bbox_top: 0, // placeholder
    bbox_bottom: 0, // placeholder
    direction: 0, // placeholder
    speed: 0, // placeholder
    vspeed: 0, // placeholder
    hspeed: 0, // placeholder
    friction: 0, // placeholder
    gravity: 0, // placeholder
    gravity_direction: 270, // gravity direction
    visible: true, // sprite visibility
    image_blend: c_white,
    image_angle: 0,
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    floweysong,
    conversation,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    step,
    alarm0,
    alarm1,
    alarm2,
    alarm3,
    alarm4,
    alarm5,
    alarm6,
    alarm7,
    alarm8,
    alarm9,
    alarm10,
    alarm11,
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
  if (
    (this.sprite_index === "spr_floweyniceshock" ||
      this.sprite_index === "spr_floweyhurt" ||
      this.sprite_index === "spr_floweyside") &&
    this.image_index >= 1
  ) {
    this.image_speed = 0;
    this.image_index = 0;
  }

  getBoundingBox.call(this);

  // Apply friction
  if (this.friction !== 0 && this.speed > 0) {
    this.speed -= this.friction;
    if (this.speed < 0) this.speed = 0;
  }

  // Convert direction to radians and calculate velocity components from speed
  let dirRad = -(this.direction * Math.PI) / 180;
  this.hspeed = Math.cos(dirRad) * this.speed;
  this.vspeed = Math.sin(dirRad) * this.speed;

  // Apply gravity vector
  if (this.gravity) {
    let gravRad = this.gravity_direction * (Math.PI / 180);
    this.hspeed += Math.cos(gravRad) * this.gravity;
    this.vspeed -= Math.sin(gravRad) * this.gravity;

    // Recalculate speed and direction based on new velocity
    this.speed = Math.sqrt(
      this.hspeed * this.hspeed + this.vspeed * this.vspeed
    );
    this.direction = Math.atan2(-this.vspeed, this.hspeed) * (180 / Math.PI);
  }

  // Update position
  this.x += this.hspeed;
  this.y += this.vspeed;
}

function updateSprite() {
  if (this.visible === true) {
    let img = draw_sprite_ext(
      this.sprite_index,
      this.image_index,
      this.x,
      this.y,
      this.image_xscale,
      this.image_yscale,
      this.image_angle,
      this.image_blend,
      this.image_alpha,
      1
    );
    if (img) {
      this.sprite_width = img.width;
      this.sprite_height = img.height;
    }
  }
}

function step() {
  const uborder = instances.get(obj_uborder)[0];
  const rborder = instances.get(obj_rborder)[0];
  const dborder = instances.get(obj_dborder)[0];
  const lborder = instances.get(obj_lborder)[0];
  const fakeheart = instances.get(obj_fakeheart)[0];
  const friendlypellets = instances.get(obj_friendlypellet);
  SCR_BORDERSETUP(0, 0, 0, 0, 0);

  if (instance_exists(OBJ_WRITER)) {
    if (instances.get(OBJ_WRITER).length > 0) {
      if (instances.get(OBJ_WRITER)[0].halt !== 0) {
        this.image_speed = 0;
        this.image_index = 0;
      } else {
        this.image_speed = 0.2;
      }
    }
  }

  if (instance_exists(obj_winkstar) === false) {
    if (instance_exists(OBJ_WRITER) === false) {
      if (this.conversation === 17) {
        this.image_angle += 5;
        this.gravity_direction = 270;
        this.direction = 155;
        this.speed = 20;
        this.gravity = 10;
      }

      if (this.conversation === 14) {
        this.sprite_index = "spr_floweylaugh";
        this.image_speed = 0.5;

        _with(this.blcon, function () {
          instance_destroy(this);
        });

        _with(obj_fakepellet, function () {
          this.attackyou = 1;
        });

        _with(obj_fakeheart, function () {
          this.movement = 1;
        });

        this.conversation = 15;
        this.alarm[9] = 150;
        snd_play(snd_floweylaugh);
      }

      if (this.conversation === 12) {
        global.border = 4;

        _with(this.blcon, function () {
          instance_destroy(this);
        });

        this.sprite_index = "spr_floweyevil";
        this.alarm[2] = 70;
        this.conversation = 13;
        _with(obj_fakeheart, function () {
          this.movement = 0;
        });

        instance_create(
          (uborder.x + rborder.x) / 2,
          dborder.y + 40,
          obj_radialfakegen
        );
      }

      if (this.conversation === 10) {
        caster_stop(this.floweysong);
        this.sprite_index = "spr_floweygrin";
        this.alarm[1] = 60;
        this.conversation = 11;
      }

      if (this.conversation == 9) {
        this.alarm[4] = 30;
        this.sprite_index = "spr_floweypissed";
        caster_set_pitch(this.floweysong, 0.9);
        this.conversation = 9.1;
      }

      if (this.conversation == 7) {
        _with(this.blcon, function () {
          instance_destroy(this);
        });

        this.sprite_index = "spr_floweynice";

        for (let i = 0; i !== 5; i += 1) {
          let ddd = instance_find(obj_friendlypellet, i);
          ddd.x = ddd.blonicx;
          ddd.y = ddd.blonicy;
          ddd.attackyou = 1;
        }

        this.conversation = 8;
      }

      if (this.conversation == 5) {
        caster_set_pitch(this.floweysong, 0.95);
        this.sprite_index = "spr_floweysassy";
        this.conversation = 6;
        this.alarm[3] = 30;
      }

      if (this.conversation == 3) {
        _with(obj_blconwdflowey, function () {
          instance_destroy(this);
        });

        this.image_index = 0;
        this.image_speed = 0;
      }

      if (this.conversation == 2) {
        this.sprite_index = "spr_floweynice";
        for (const friendlypellet of friendlypellets) {
          friendlypellet.attackyou = 1;
        }
        global.msc = 668;
        this.blconwriter = instance_create(
          this.blcon.x + 40,
          this.blcon.y + 10,
          OBJ_WRITER
        );
        this.conversation = 3;
      }

      if (this.conversation == 1.5) {
        this.blcon = instance_create(
          this.x + 40 + this.sprite_width,
          this.y,
          obj_blconwdflowey
        );
        global.msc = 667;
        this.blconwriter = instance_create(
          this.blcon.x + 40,
          this.blcon.y + 10,
          OBJ_WRITER
        );
        this.conversation = 2;
        this.sprite_index = "spr_floweyniceside";
        instance_create(
          this.x + 10 + this.sprite_width / 2,
          this.y + this.sprite_width / 2,
          obj_friendlypellet
        );
        instance_create(
          this.x + 10 + this.sprite_width / 2,
          this.y + this.sprite_width / 2,
          obj_friendlypellet
        );
        instance_create(
          this.x + 10 + this.sprite_width / 2,
          this.y + this.sprite_width / 2,
          obj_friendlypellet
        );
        instance_create(
          this.x + 10 + this.sprite_width / 2,
          this.y + this.sprite_width / 2,
          obj_friendlypellet
        );
        instance_create(
          this.x + 10 + this.sprite_width / 2,
          this.y + this.sprite_width / 2,
          obj_friendlypellet
        );
      }

      if (this.conversation === 1) {
        this.sprite_index = "spr_floweywink";
        this.conversation = 1.5;

        _with(obj_blconwdflowey, function () {
          instance_destroy(this);
        });

        instance_create(this.x + 70, this.y + 10, obj_winkstar);
      }
    }
  }

  if (this.conversation == 9.5) {
    this.alarm[7] = 80;
    if (instances.get(OBJ_WRITER)) {
      _with(OBJ_WRITER, function () {
        this.halt = 3;
      });
    }

    _with(this.blcon, function () {
      instance_destroy(this);
    });

    this.conversation = 9.6;
    this.pitchlower = 1;
  }

  if (this.conversation == 9.6) {
    this.pitchlower -= 0.02;

    if (this.pitchlower > -0.5) {
      caster_set_pitch(this.floweysong, 0.65 + this.pitchlower / 4);
      caster_set_volume(this.floweysong, 0.5 + this.pitchlower / 2);
    }
  }

  if (global.faceemotion === 1) this.sprite_index = "spr_floweynicesideum";

  if (global.faceemotion === 2) this.sprite_index = "spr_floweynice";

  if (this.conversation == 13) {
    if (fakeheart.x < lborder.x) fakeheart.x = lborder.x;

    if (fakeheart.x > rborder.x) fakeheart.x = rborder.x;

    if (fakeheart.y < uborder.y) fakeheart.y = uborder.y;
  }

  if (instance_exists(OBJ_WRITER)) {
    if (this.conversation === 1) scr_textskip();
  }
}

function alarm0() {
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  global.msc = 666;
  global.typer = 6;
  this.conversation = 1;
  this.image_speed = 0.2;
  instance_create(
    instances.get(obj_fakeheart)[0].x - 14,
    instances.get(obj_fakeheart)[0].y - 14,
    obj_guidearrows
  );
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm1() {
  global.typer = 7;
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  this.conversation = 12;
  global.msc = 669;
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm2() {
  global.typer = 20;
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  this.conversation = 14;
  global.msc = 670;
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm3() {
  global.typer = 6;
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  this.conversation = 7;
  global.msc = 671;
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm4() {
  this.alarm[6] = 170;
  global.typer = 6;
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  this.conversation = 9.2;
  global.msc = 672;
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm5() {
  _with(this.blconwriter, function () {
    instance_destroy(this);
  });

  global.msc = 0;
  global.msg[0] = scr_gettext("obj_floweybattle1_268");
  global.msg[1] = scr_gettext("obj_floweybattle1_269");
  global.msg[2] = scr_gettext("obj_floweybattle1_270");
  global.msg[3] = scr_gettext("obj_floweybattle1_271");
  global.msg[4] = scr_gettext("obj_floweybattle1_272");
  global.msg[5] = scr_gettext("obj_floweybattle1_273");
  global.msg[6] = scr_gettext("obj_floweybattle1_274");
  global.msg[7] = scr_gettext("obj_floweybattle1_275");
  global.msg[8] = scr_gettext("obj_floweybattle1_276");
  global.msg[9] = scr_gettext("obj_floweybattle1_277");
  global.msg[10] = scr_gettext("obj_floweybattle1_278");

  this.funwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_INSTAWRITER
  );
  this.sprite_index = "spr_floweynice";
  this.image_index = 1;
  this.image_speed = 0;
  this.conversation = 9.4;

  for (let i = 0; i !== 5; i += 1) {
    let ddd = instance_find(obj_friendlypellet, i);
    ddd.x = ddd.blonicx;
    ddd.y = ddd.blonicy;
    ddd.attackyou = 1;
  }
}

function alarm6() {
  this.sprite_index = "spr_floweyside";
  this.alarm[5] = 40;
  this.conversation = 9.3;
}

function alarm7() {
  this.sprite_index = "spr_floweyevil";

  if (instance_exists(obj_blconwdflowey)) {
    _with(obj_blconwdflowey, function () {
      instance_destroy(this);
    });
  }

  this.alarm[8] = 30;
  caster_stop(this.floweysong);
  caster_free(this.floweysong);
}

function alarm8() {
  _with(this.funwriter, function () {
    instance_destroy(this);
  });

  global.typer = 7;
  this.blcon = instance_create(
    this.x + 40 + this.sprite_width,
    this.y,
    obj_blconwdflowey
  );
  this.conversation = 12;
  global.msc = 673;
  this.blconwriter = instance_create(
    this.blcon.x + 40,
    this.blcon.y + 10,
    OBJ_WRITER
  );
}

function alarm9() {
  if (this.conversation <= 15) {
    snd_stop(snd_floweylaugh);
    global.hshake = 3;
    global.shakespeed = 1.5;
    global.vshake = 3;
    snd_play(snd_power);
    global.hp = global.maxhp;
    instance_create(0, 0, obj_shaker);

    if (instance_exists(obj_fakepellet)) {
      instances.get(obj_fakepellet)[0].x = -800;
    }

    this.conversation = 16;
    this.image_speed = 0;
    instance_create(this.x + 200, this.y + 10, obj_torielflame_X);
    this.alarm[10] = 60;
  }
}

function alarm10() {
  this.sprite_index = "spr_floweypissed";
  this.alarm[11] = 60;
}

function alarm11() {
  this.sprite_index = "spr_floweysideshock";
}

function outsideRoom() {
  if (!instance_exists(obj_torielcutscene)) {
    instance_create(this.xstart + 500, this.ystart - 80, obj_torielcutscene);
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  step,
  alarm0,
  alarm1,
  alarm2,
  alarm3,
  alarm4,
  alarm5,
  alarm6,
  alarm7,
  alarm8,
  alarm9,
  alarm10,
  alarm11,
  outsideRoom,
};
