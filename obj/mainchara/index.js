import {
  draw_sprite_ext,
  merge_color,
  instance_exists,
  round,
  keyboard_check,
  draw_sprite,
  draw_sprite_part_ext,
  collision_rectangle,
  collision_line,
  collision_point,
  script_execute,
  getBoundingBox,
  instances,
  instance_create,
  _with,
  draw_rectangle,
  draw_set_color
} from "/imports/assets/gamemakerFunctions.js";
import {
  c_white,
  c_gray,
  c_black,
  snd_splash,
  snd_squeak,
  c_red,
} from "/imports/assets.js";
import global from "/imports/assets/global.js";
import {
  scr_hardmodename,
  snd_play,
  scr_interact,
  caster_resume,
} from "/imports/customFunctions.js";
import {
  view_xview,
  view_yview,
  view_wview,
  view_hview,
} from "/imports/view.js";
import { control_check_pressed, control_clear } from "/imports/input.js";

import * as obj_shaker from "/obj/shaker/index.js";
import * as obj_markerA from "/obj/markerA/index.js";
import * as obj_markerB from "/obj/markerB/index.js";
import * as obj_interactable from "/obj/interactable/index.js";
import * as obj_doorparent from "/obj/doorparent/index.js";
import * as obj_solidnpcparent from "/obj/solidnpcparent/index.js";
import * as obj_solidparent from "/obj/solidparent/index.js";
import * as obj_sdl from "/obj/sdl/index.js";
import * as obj_sdr from "/obj/sdr/index.js";
import * as obj_sul from "/obj/sul/index.js";
import * as obj_sur from "/obj/sur/index.js";
import * as obj_musfadein from "/obj/musfadein/index.js";
import * as obj_battler from "/obj/battler/index.js";

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

  global.currentroom = `${window.location.href.slice(35, 39)}_${window.location.href.slice(40).split("/")[0]}`;

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
    depth: 100, // object depth
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
    delayStep: 1,

    // object functions. add to here if you want them to be accessible from this. context
    updateAlarms,
    updateGamemakerFunctions,
    updateSprite,
    roomStart,
    endStep,
    step,
    user0,
    user2,
    checkCol,
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
  if (
    this.image_index >= this.image_number_lr &&
    (this.sprite_index === "spr_maincharal" ||
      this.sprite_index === "spr_maincharar" ||
      this.sprite_index === "spr_maincharar_umbrella" ||
      this.sprite_index === "spr_maincharal_umbrella")
  ) {
    this.image_index -= this.image_number_lr;
  }
  if (
    this.image_index >= this.image_number_ud &&
    (this.sprite_index === "spr_maincharad" ||
      this.sprite_index === "spr_maincharau" ||
      this.sprite_index === "spr_maincharad_umbrella" ||
      this.sprite_index === "spr_maincharau_umbrella")
  ) {
    this.image_index -= this.image_number_ud;
  }
  getBoundingBox.call(this);

  this.checkCol();

  this.previousx = this.x;
  this.xprevious = this.x;
  this.previousy = this.y;
  this.yprevious = this.y;
}

function updateSprite() {
  if (this.visible) {
    if (this.inwater == 0)
      this.img = draw_sprite_ext(
        this.sprite_index,
        this.image_index,
        this.x,
        this.y,
        this.image_xscale,
        this.image_yscale,
        0,
        this.image_blend,
        this.image_alpha,
        1
      );
    if (this.img) {
      this.sprite_height = this.img.height;
      this.sprite_width = this.img.width;
    }
    if (this.inwater == 1) {
      draw_sprite_part_ext(
        this.sprite_index,
        this.image_index,
        0,
        0,
        this.sprite_width,
        this.sprite_height - 5,
        this.x,
        this.y + 5,
        1,
        1,
        c_white,
        this.image_alpha
      );

      if (this.image_index == 1 || this.image_index == 3) {
        snd_play(snd_splash);
        this.mp = 0;
      }

      draw_sprite("spr_waterripple", 0, this.x, this.y);
    }

    if (global.currentroom === "room_water_waterfall3")
      draw_sprite_ext(
        this.sprite_index,
        this.image_index,
        this.x,
        this.y,
        1,
        1,
        0,
        c_black,
        this.image_alpha
      );
  }
}

function roomStart() {
  if (global.interact == 3) {
    if (global.entrance > 0) {
      global.interact = 0;

      if (global.entrance == 1) {
        this.x = instances.get(obj_markerA)[0].x;
        this.y = instances.get(obj_markerA)[0].y;
      }

      if (global.entrance == 2) {
        this.x = instances.get(obj_markerB)[0].x;
        this.y = instances.get(obj_markerB)[0].y;
      }

      if (global.entrance == 4) {
        this.x = instances.get(obj_markerC)[0].x;
        this.y = instances.get(obj_markerC)[0].y;
      }

      if (global.entrance == 5) {
        this.x = instances.get(obj_markerD)[0].x;
        this.y = instances.get(obj_markerD)[0].y;
      }

      if (global.entrance == 18) {
        this.x = instances.get(obj_markerr)[0].x;
        this.y = instances.get(obj_markerr)[0].y;
      }

      if (global.entrance == 19) {
        this.x = instances.get(obj_markers)[0].x;
        this.y = instances.get(obj_markers)[0].y;
      }

      if (global.entrance == 20) {
        this.x = instances.get(obj_markert)[0].x;
        this.y = instances.get(obj_markert)[0].y;
      }

      if (global.entrance == 21) {
        this.x = instances.get(obj_markeru)[0].x;
        this.y = instances.get(obj_markeru)[0].y;
      }

      if (global.entrance == 22) {
        this.x = instances.get(obj_markerv)[0].x;
        this.y = instances.get(obj_markerv)[0].y;
      }

      if (global.entrance == 23) {
        this.x = instances.get(obj_markerw)[0].x;
        this.y = instances.get(obj_markerw)[0].y;
      }

      if (global.entrance == 24) {
        this.x = instances.get(obj_markerX)[0].x;
        this.y = instances.get(obj_markerX)[0].y;
      }
    }
  }

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

  if (global.facing === 0) this.sprite_index = this.dsprite;

  if (global.facing === 1) this.sprite_index = this.rsprite;

  if (global.facing === 2) this.sprite_index = this.usprite;

  if (global.facing === 3) this.sprite_index = this.lsprite;

  if (global.flag[480] === 1) {
    this.image_blend = merge_color(c_gray, c_white, 0.3);
  }

  this.depth = 50000 - (this.y * 10 + this.sprite_height * 10);
  getBoundingBox.call(this);
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

  if (
    Math.abs(this.xprevious - this.x) > 0.01 ||
    Math.abs(this.previousy - this.y) > 0.01
  ) {
    this.moving = 1;
  }
  if (this.moving == 0) {
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
      view_xview[0] = round(this.x - view_wview[0] / 2 + 10);
      view_yview[0] = round(this.y - view_hview[0] / 2 + 10);
    }
  }
}

function step() {
  if (global.facing == 0) this.sprite_index = this.dsprite;

  if (global.facing == 1) this.sprite_index = this.rsprite;

  if (global.facing == 2) this.sprite_index = this.usprite;

  if (global.facing == 3) this.sprite_index = this.lsprite;

  if (
    collision_point(
      this.bbox_left - 3,
      this.bbox_top - 3,
      obj_solidparent,
      0,
      1
    ) === null
  ) {
    this.crumpet = 1;
  } else {
    this.crumpet = 2;
  }

  this.strumpet = this.bbox_top;
  this.trumpet = this.bbox_left;

  if (global.inbattle == 1) {
    if (global.flag[15] == 0) {
      instance_create(0, 0, obj_musfadein);
      caster_resume(global.currentsong);
    }

    global.room_persistent = "";
    global.inbattle = 0;

    if (global.specialbattle == 0) global.interact = 0;

    this.depth = 100;

    if (global.flag[200] != 0) {
      if (global.flag[201] != global.kills)
        global.flag[global.flag[200]] += global.kills - global.flag[201];
    }
  }

  if (global.left) {
    if (this.movement == 1) {
      this.turned = 1;

      if (this.xprevious == this.x + 3) this.x -= 2;
      else this.x -= 3;

      if (this.moving != 1) this.image_index = 1;

      this.moving = 1;

      if (global.debug == 1) {
        if (keyboard_check("Backspace")) this.x -= 5;
      }

      this.image_speed = 0.2;

      if (global.up && global.facing == 2) this.turned = 0;

      if (global.down && global.facing == 0) this.turned = 0;

      if (this.turned == 1) global.facing = 3;
    }
  }

  if (global.up) {
    if (this.movement == 1) {
      this.turned = 1;
      this.y -= 3;

      if (global.debug == 1) {
        if (keyboard_check("Backspace")) y -= 5;
      }

      if (this.moving != 1) this.image_index = 1;

      this.moving = 1;
      this.image_speed = 0.2;

      if (global.right && global.facing == 1) this.turned = 0;

      if (global.left && global.facing == 3) this.turned = 0;

      if (this.turned == 1) global.facing = 2;
    }
  }

  if (global.right) {
    if (this.movement == 1) {
      if (global.left == 0) {
        this.turned = 1;

        if (this.xprevious == this.x - 3) this.x += 2;
        else this.x += 3;

        if (global.debug == 1) {
          if (keyboard_check("Backspace")) this.x += 5;
        }

        this.moving = 1;
        this.image_speed = 0.2;

        if (this.moving != 1) this.image_index = 1;

        if (global.up && global.facing == 2) this.turned = 0;

        if (global.down && global.facing == 0) this.turned = 0;

        if (this.turned == 1) global.facing = 1;
      }
    }
  }

  if (global.down) {
    if (this.movement == 1) {
      if (global.up == 0) {
        this.turned = 1;
        this.y += 3;

        if (global.debug == 1) {
          if (keyboard_check("Backspace")) this.y += 5;
        }

        if (this.moving != 1) this.image_index = 1;

        this.moving = 1;
        this.image_speed = 0.2;

        if (global.right && global.facing == 1) this.turned = 0;

        if (global.left && global.facing == 3) this.turned = 0;

        if (this.turned == 1) global.facing = 0;
      }
    }
  }

  if (control_check_pressed(0)) this.user0();

  if (control_check_pressed(2)) this.user2();

  this.door = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_doorparent,
    false,
    false
  );

  if (this.door && this.delayStep-- > 0) {
    this.door.user9();
  }

  if (instance_exists(obj_battler) === false) {
    this.depth = 50000 - (this.y * 10 + this.sprite_height * 10);

    if (global.flag[85] == 1 && this.dsprite == "spr_maincharad_umbrella")
      this.depth = 50000 - (this.y * 10 + 300);
  }
}

function user0() {
  if (global.interact == 0 && this.uncan == 0)
  {
    if (instance_exists("obj_itemswapper") == false)
    {
        if (global.facing == 1)
        {
            if (collision_rectangle.call(this, this.x + (this.sprite_width / 2), this.y + 19, this.x + this.sprite_width + 15, this.y + this.sprite_height, obj_interactable, 0, 1))
            {
                const interactedobject = collision_rectangle.call(this, this.x + (this.sprite_width / 2), this.y + (this.sprite_height / 2), this.x + this.sprite_width + 15, this.y + this.sprite_height, obj_interactable, 0, 1);
                
                if (interactedobject != -4)
                {
                    _with (interactedobject, function() {
                        this.facing = 3;
                    })
                    
                    _with (interactedobject, function() {
                        script_execute.call(this, scr_interact);
                    })
                }
            }
        }
        
        if (global.facing == 3)
        {
            if (collision_rectangle.call(this, this.x + (this.sprite_width / 2), this.y + 19, this.x - 15, this.y + this.sprite_height, obj_interactable, 0, 1))
            {
                const interactedobject = collision_rectangle.call(this, this.x + (this.sprite_width / 2), this.y + 3 + (this.sprite_height / 2), this.x - 15, this.y + this.sprite_height + 3, obj_interactable, 0, 1);
                
                if (interactedobject != null)
                {
                    _with (interactedobject, function() {
                        this.facing = 1;
                    })
                    
                    _with (interactedobject, function() {
                        script_execute.call(this, scr_interact);
                    })
                }
            }
        }
        
        if (global.facing == 0)
        {
            if (collision_rectangle.call(this, this.x + 4, this.y + 20, (this.x + this.sprite_width) - 4, this.y + this.sprite_height + 15, obj_interactable, 0, 1))
            {
                const interactedobject = collision_rectangle.call(this, this.x + 4, this.y + 20, (this.x + this.sprite_width) - 4, this.y + this.sprite_height + 15, obj_interactable, 0, 1);
                
                if (interactedobject != null)
                {
                    _with (interactedobject, function() {
                        this.facing = 2;
                    })
                    
                    _with (interactedobject, function() {
                        script_execute.call(this, scr_interact);
                    })
                }
            }
        }
        
        if (global.facing == 2)
        {
            if (collision_rectangle.call(this, this.x + 4, (this.y + this.sprite_height) - 5, (this.x + this.sprite_width) - 4, this.y + 5, obj_interactable, 0, 1))
            {
                const interactedobject = collision_rectangle.call(this, this.x + 4, (this.y + this.sprite_height) - 5, (this.x + this.sprite_width) - 4, this.y + 8, obj_interactable, 0, 1);
                
                if (interactedobject != null)
                {
                    _with (interactedobject, function() {
                        this.facing = 0;
                    })
                    
                    _with (interactedobject, function() {
                        script_execute.call(this, scr_interact);
                    })
                }
            }
        }
    }
  }
}

function user2() {
  if (global.interact == 0 && global.flag[17] == 0) {
    snd_play(snd_squeak);
    global.interact = 5;
    global.menuno = 0;
    control_clear(2);
  }
}

function checkCol() {
  let other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_solidnpcparent,
    false,
    false
  );
  if (other) {
    if (global.phasing === 0) {
      this.x = this.xprevious;
      this.y = this.yprevious;
      getBoundingBox.call(this);
      this.moving = 0;
    }
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_solidparent,
    false,
    false
  );
  if (other) {
    if (global.phasing == 0 && other.phase == 0) {
      this.x = this.xprevious;
      this.y = this.yprevious;

      getBoundingBox.call(this);

      if (global.interact == 0) {
        if (global.up) {
          if (
            collision_rectangle.call(
              this,
              this.x + 2,
              this.y + 15,
              this.x + 18,
              this.y + 19,
              obj_solidparent,
              0,
              1
            ) !== null
          ) {
            if (
              global.left &&
              collision_line.call(
                this,
                this.bbox_left + 3,
                this.bbox_top,
                this.bbox_left,
                this.bbox_top,
                obj_solidparent,
                false,
                true
              ) === null
            ) {
              this.x -= 3;
              global.facing = 3;
            }

            if (
              global.right &&
              collision_line.call(
                this,
                this.bbox_right - 3,
                this.bbox_top,
                this.bbox_right,
                this.bbox_top + 15,
                obj_solidparent,
                false,
                true
              ) === null
            ) {
              this.x += 3;
              global.facing = 1;
            }
          } else {
            this.y -= 3;
            global.facing = 2;
          }
        }

        if (global.down) {
          if (
            collision_rectangle.call(
              this,
              this.x + 2,
              this.y + 30,
              this.x + 19,
              this.y + 33,
              obj_solidparent,
              0,
              1
            ) !== null
          ) {
            if (
              global.left &&
              collision_line.call(
                this,
                this.bbox_left + 3,
                this.bbox_bottom,
                this.bbox_left,
                this.bbox_bottom,
                obj_solidparent,
                false,
                true
              ) === null
            ) {
              this.x -= 3;
              global.facing = 3;
            }

            if (
              global.right &&
              collision_line.call(
                this,
                this.bbox_right - 3,
                this.bbox_bottom,
                this.bbox_right,
                this.bbox_bottom,
                obj_solidparent,
                false,
                true
              ) === null
            ) {
              this.x += 3;
              global.facing = 1;
            }
          } else {
            this.y += 3;
            global.facing = 0;
          }
        }
      }

      this.moving = 0;
    }
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_sul,
    true,
    false
  );
  if (other) {
    if (global.phasing === 0 && global.interact === 0) {
      switch (global.facing) {
        case 3:
          if (
            collision_point.call(
              this,
              this.bbox_left - 3,
              this.bbox_bottom + 3,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious - 3;
            this.y = this.yprevious + 3;
          } else {
            this.x = this.xprevious;
          }
          break;
        case 2:
          if (
            collision_point.call(
              this,
              this.bbox_right + 3,
              this.bbox_top - 3,
              obj_solidparent,
              0,
              0
            ) === null
          ) {
            this.x = this.xprevious + 3;
            this.y = this.yprevious - 3;
          } else {
            this.y = this.yprevious;
          }
          break;
        case 1:
          this.y = this.yprevious;
          this.x = this.xprevious + 3;
          break;
        case 0:
          this.x = this.xprevious;
          this.y = this.yprevious + 3;
          break;
      }

      if (global.up && global.left) {
        this.x = this.xprevious;
        this.y = this.yprevious;
      }

      if (this.x % 3 !== 0) {
        this.x += 1;
      }

      if (this.y % 3 !== 0) {
        this.y += 1;
      }

      this.moving = 0;

      getBoundingBox.call(this);
    }

    if (
      global.interact === 5 ||
      global.interact === 1 ||
      (global.interact === 3 && global.phasing === 0)
    ) {
      this.x = this.xprevious;
      this.y = this.yprevious;
      getBoundingBox.call(this);
    }
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_sur,
    true,
    false
  );
  if (other) {
    if (global.phasing === 0 && global.interact === 0) {
      switch (global.facing) {
        case 1:
          if (
            collision_point.call(
              this,
              this.bbox_left + 3,
              this.bbox_bottom + 3,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious + 3;
            this.y = this.yprevious + 3;
          } else {
            this.x = this.xprevious;
          }
          break;
        case 2:
          if (
            collision_point.call(
              this,
              this.bbox_right - 3,
              this.bbox_top - 3,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious - 3;
            this.y = this.yprevious - 3;
          } else {
            this.y = this.yprevious;
          }
          break;
        case 0:
          this.y = this.yprevious;
          this.x = this.xprevious + 3;
          break;
        case 3:
          this.x = this.xprevious;
          this.y = this.yprevious - 3;
          break;
      }

      if (global.up && global.right) {
        this.x = this.xprevious;
        this.y = this.yprevious;
      }

      if (this.x % 3 !== 0) {
        this.x -= 1;
      }

      if (this.y % 3 !== 0) {
        this.y += 1;
      }

      this.moving = 0;

      getBoundingBox.call(this);
    }

    if (
      global.interact === 5 ||
      global.interact === 1 ||
      (global.interact === 3 && global.phasing === 0)
    ) {
      this.x = this.xprevious;
      this.y = this.yprevious;
      getBoundingBox.call(this);
    }
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_sdl,
    true,
    false
  );
  if (other) {
    if (global.phasing === 0 && global.interact === 0) {
      switch (global.facing) {
        case 3:
          if (
            collision_point.call(
              this,
              this.bbox_left - 2,
              this.bbox_bottom - 2,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious - 3;
            this.y = this.yprevious - 3;
          } else {
            this.x = this.xprevious;
          }
          break;
        case 0:
          if (
            collision_point.call(
              this,
              this.bbox_right + 3,
              this.bbox_top + 3,
              obj_solidparent,
              0,
              0
            ) === null
          ) {
            this.x = this.xprevious + 3;
            this.y = this.yprevious + 3;
          } else {
            this.y = this.yprevious;
          }
          break;
        case 2:
          this.y = this.yprevious;
          this.x = this.xprevious - 3;
          break;
        case 1:
          this.x = this.xprevious;
          this.y = this.yprevious + 3;
          break;
      }

      if (global.down && global.left) {
        this.x = this.xprevious;
        this.y = this.yprevious;
      }

      if (this.x % 3 !== 0) {
        this.x += 1;
      }

      if (this.y % 3 !== 0) {
        this.y -= 1;
      }

      this.moving = 0;

      getBoundingBox.call(this);
    }

    if (
      global.interact === 5 ||
      global.interact === 1 ||
      (global.interact === 3 && global.phasing === 0)
    ) {
      this.x = this.xprevious;
      this.y = this.yprevious;
      getBoundingBox.call(this);
    }
  }
  other = collision_rectangle.call(
    this,
    this.bbox_left,
    this.bbox_top,
    this.bbox_right,
    this.bbox_bottom,
    obj_sdr,
    true,
    false
  );
  if (other) {
    if (global.phasing === 0 && global.interact === 0) {
      switch (global.facing) {
        case 1:
          if (
            collision_point.call(
              this,
              this.bbox_right + 2,
              this.bbox_top - 2,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious + 3;
            this.y = this.yprevious - 3;
          } else {
            this.x = this.xprevious;
          }
          break;
        case 0:
          if (
            collision_point.call(
              this,
              this.bbox_left - 3,
              this.bbox_bottom + 3,
              obj_solidparent,
              0,
              1
            ) === null
          ) {
            this.x = this.xprevious - 3;
            this.y = this.yprevious + 3;
          } else {
            this.y = this.yprevious;
          }
          break;
        case 2:
          this.y = this.yprevious;
          this.x = this.xprevious - 3;
          break;
        case 3:
          this.x = this.xprevious;
          this.y = this.yprevious - 3;
          break;
      }

      if (global.down && global.right) {
        this.x = this.xprevious;
        this.y = this.yprevious;
      }

      if (this.x % 3 !== 0) {
        this.x += 1;
      }

      if (this.y % 3 !== 0) {
        this.y -= 1;
      }

      this.moving = 0;

      getBoundingBox.call(this);
    }

    if (
      global.interact === 5 ||
      global.interact === 1 ||
      (global.interact === 3 && global.phasing === 0)
    ) {
      this.x = this.xprevious;
      this.y = this.yprevious;
      getBoundingBox.call(this);
    }
  }
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  updateSprite,
  roomStart,
  endStep,
  step,
  user0,
  user2,
  checkCol,
};
