import {
  draw_sprite_ext,
  getBoundingBox,
  instance_create,
  instance_destroy,
  instance_exists,
  string,
} from "/imports/assets/gamemakerFunctions.js";
import {
  scr_depth,
  scr_gettext,
  scr_murderlv,
  snd_play,
} from "/imports/customFunctions.js";
import { c_white, snd_power } from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_dialoguer from "/obj/dialoguer/index.js";
import * as parent from "/obj/readablesolid/index.js"; // change as neccesary. if no parent, replace this line with "const parent = null;"
import * as OBJ_WRITER from "/obj/writer/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code

  const self = {
    name: "savepoint", // sprite name
    depth: 0, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0.2, // sprite frame speed
    image_number: 2, // sprite frame number
    sprite_width: 0, // set to sprite_index's width
    sprite_height: 0, // set to sprite_index's height
    image_angle: 0,
    image_blend: c_white,
    sprite_index: "spr_savepoint", // sprite object
    visible: true, // sprite visibility
    friction: 0,
    gravity: 0,
    gravity_direction: 270, // gravity direction
    parent: parent,

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    myinteract: 0,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    alarm0,
    beginStep,
    step,
  };

  self._hspeed = 0;
  self._vspeed = 0;
  self._speed = 0;
  self._direction = 0;

  Object.defineProperty(self, "hspeed", {
    get() {
      return this._hspeed;
    },
    set(val) {
      this._hspeed = val;
      this._updatePolarFromCartesian();
    },
  });

  Object.defineProperty(self, "vspeed", {
    get() {
      return this._vspeed;
    },
    set(val) {
      this._vspeed = val;
      this._updatePolarFromCartesian();
    },
  });

  Object.defineProperty(self, "speed", {
    get() {
      return this._speed;
    },
    set(val) {
      this._speed = val;
      this._updateCartesianFromPolar();
    },
  });

  Object.defineProperty(self, "direction", {
    get() {
      return this._direction;
    },
    set(val) {
      this._direction = val;
      this._updateCartesianFromPolar();
    },
  });

  self._updateCartesianFromPolar = function () {
    const rad = (this._direction * Math.PI) / 180;
    this._hspeed = Math.cos(rad) * this._speed;
    this._vspeed = -Math.sin(rad) * this._speed;
  };

  self._updatePolarFromCartesian = function () {
    this._speed = Math.sqrt(this._hspeed ** 2 + this._vspeed ** 2);
    this._direction = Math.atan2(-this._vspeed, this._hspeed) * (180 / Math.PI);
  };

  return self;
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

    this.animationEnd?.();
  }

  getBoundingBox.call(this); // uncomment if bounding box is needed for something (collision checks from this or others)

  this.previousx = this.x;
  this.xprevious = this.x;
  this.previousy = this.y;
  this.yprevious = this.y;

  // Apply friction
  if (this.friction !== 0 && this.speed > 0) {
    this.speed -= this.friction;
    if (this.speed < 0) this.speed = 0;
  }

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

function roomStart() {
  if (global.flag[493] >= 12 && global.flag[7] == 0) {
    if (
      window.location.href ==
      "https://undertale.defautluser0.xyz/room/castle_front/"
    )
      instance_destroy(this);
    if (
      window.location.href ==
      "https://undertale.defautluser0.xyz/room/castle_finalshoehorn/"
    )
      instance_destroy(this);

    if (
      window.location.href ==
      "https://undertale.defautluser0.xyz/room/sanscorridor/"
    )
      instance_destroy(this);

    if (
      window.location.href ==
      "https://undertale.defautluser0.xyz/room/castle_elevatorout/"
    )
      instance_destroy(this);

    if (
      window.location.href ==
      "https://undertale.defautluser0.xyz/room/castle_throneroom/"
    )
      instance_destroy(this);
  }

  if (
    window.location.href == "https://undertale.defautluser0.xyz/room/water19/"
  ) {
    if (
      scr_murderlv.call(this) < 11 ||
      global.flag[27] == 1 ||
      global.plot > 119
    )
      instance_destroy(this);
  }
}

function alarm0() {
  this.myinteract = 4;
  global.msc = 15;
  global.typer = 5;
  global.facechoice = 0;
  global.faceemotion = 0;

  if (global.hp < global.maxhp) global.hp = global.maxhp;

  global.en = global.maxen;
  snd_play(snd_power);
  this.offroom = 0;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/castle_front/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/castle_throneroom/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/castle_finalshoehorn/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/castle_prebarrier/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/sanscorridor/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/castle_elevatorout/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/truelab_hub/"
  )
    this.offroom = 1;

  if (
    window.location.href ===
    "https://undertale.defautluser0.xyz/room/truelab_bedroom/"
  )
    this.offroom = 1;

  if (scr_murderlv.call(this) >= 2 && global.flag[27] == 0) {
    if (
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/tundra3/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/tundra_spaghetti/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/tundra_lesserdog/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/tundra_town/"
    ) {
      if (global.flag[27] == 0) {
        global.msc = 0;
        this.pop = 16 - global.flag[203];

        if (this.pop < 0) this.pop = 0;

        if (scr_murderlv.call(this) >= 2)
          global.msg[0] = scr_gettext("obj_savepoint_97", string(this.pop));

        if (scr_murderlv.call(this) == 5)
          global.msg[0] = scr_gettext("obj_savepoint_99"); // \R* That comedian.../%%

        if (global.flag[57] == 2 && this.pop <= 0)
          global.msg[0] = scr_gettext("obj_savepoint_101"); // * Determination./%%

        if (this.pop <= 0 && global.flag[57] != 2)
          global.msg[0] = scr_gettext("obj_savepoint_103"); // * The comedian got away^1.&* Failure./%%
      }
    }
  }

  if (scr_murderlv.call(this) >= 8 && global.flag[27] == 0) {
    if (
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water2/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water4/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_savepoint1/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_preundyne/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_trashsavepoint/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_friendlyhub/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_undynefinal/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water19/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/water_temvillage/"
    ) {
      if (global.flag[27] == 0) {
        global.msc = 0;
        this.pop = 18 - global.flag[204];

        if (this.pop < 0) this.pop = 0;

        if (scr_murderlv.call(this) >= 8)
          global.msg[0] = scr_gettext("obj_savepoint_118", string(this.pop));

        if (this.pop <= 0) global.msg[0] = scr_gettext("obj_savepoint_120"); // * Determination./%%
      }
    }
  }

  if (scr_murderlv.call(this) >= 12 && global.flag[27] == 0) {
    if (
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_prelab/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire6/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_savepoint1/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_mewmew2/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_savepoint2/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_hotellobby/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_core_branch/" ||
      window.location.href ===
        "https://undertale.defautluser0.xyz/room/fire_core_premett/"
    ) {
      if (global.flag[27] == 0) {
        global.msc = 0;
        this.pop = 40 - global.flag[205];

        if (this.pop < 0) this.pop = 0;

        if (scr_murderlv.call(this) >= 12)
          global.msg[0] = scr_gettext("obj_savepoint_135", string(this.pop));

        if (this.pop <= 0) global.msg[0] = scr_gettext("obj_savepoint_137"); // * Determination./%%
      }
    }
  }

  if (scr_murderlv.call(this) >= 16) {
    global.msc = 0;
    global.msg[0] = scr_gettext("obj_savepoint_145"); // * Determination./%%
  }

  if (this.offroom == 0)
    this.mydialoguer = instance_create(0, 0, obj_dialoguer);
}

function beginStep() {
  scr_depth.call(this, 0, 0, 0, 0, 0);

  if (instance_exists(OBJ_WRITER) === false && this.myinteract === 4) {
    if (global.plot < 2) {
      global.plot = 2;
    }

    global.interact = 5;
    global.menuno = 4;
    this.myinteract = 5;
  }
}

function step() {
  parent.step.call(this);
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  parent,
  roomStart,
  alarm0,
  beginStep,
  step,
};
