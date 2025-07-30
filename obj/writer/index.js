import {
  SCR_TEXTTYPE,
  snd_play,
  scr_replace_buttons_pc,
  snd_stop,
  scr_setfont,
  SCR_NEWLINE,
} from "/imports/customFunctions.js";
import { control_check_pressed, control_clear } from "/imports/input.js";
import {
  string_char_at,
  floor,
  random,
  round,
  draw_set_color,
  surface_get_width,
  draw_text_transformed,
  script_execute,
  real,
  instance_destroy,
  ord,
} from "/imports/assets/gamemakerFunctions.js";
import {
  final_view_wview,
  view_current,
  final_view_xview,
} from "/imports/view.js";
import {
  fnt_comicsans,
  fnt_papyrus,
  fnt_main,
  snd_phone,
} from "/imports/assets.js";
import { SCR_TEXT } from "/imports/assets/text.js";
import global from "/imports/assets/global.js";

import * as obj_choicer from "/obj/choicer/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  return {
    name: "writer",
    sprite_index: null,
    image_index: 0,
    image_speed: 0,
    image_number: 0,
    visible: true,
    x: 0,
    y: 0,
    alarm: alarm,
    speed: 0,
    should_destroy: false,
    depth: -500,

    // obj_base_writer
    stringno: 0,
    stringpos: 0,
    halt: 0,
    dfy: 0,
    sound_enable: 1,
    originalstring: "",
    mystring: [],

    // OBJ_WRITER

    doak: 0,

    // functions
    updateAlarms,
    updateGamemakerFunctions,
    alarm0,
    user0,
    user1,
    draw,
    step,
    beginStep,
    roomStart,
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

function alarm0() {
  if (this.stringpos >= this.originalstring.length) {
    return;
  }

  let advance = 1;

  if (global.typer == 111) {
    advance += 1;
  }

  if (this.txtsound === 56) {
    advance += 2;
  } else if (this.txtsound === 65) {
    advance += 1;
  }

  let dosound = 0;
  let delay = this.textspeed;

  // var assignment for later in the code

  let n = 0;
  let sfx = 0;
  let sfxtype = "";
  let rnsound = 0;

  while (this.stringpos < this.originalstring.length && advance > 0) {
    this.stringpos++;
    this.ch = string_char_at(this.originalstring, this.stringpos);

    if (this.ch === "^") {
      this.stringpos++;
      this.ch = string_char_at(this.originalstring, this.stringpos);

      if (this.ch !== "0") {
        n = real(this.ch);
        delay = n * 10;
        advance = 1;
      }
    } else if (this.ch === "\\") {
      this.stringpos++;
      this.ch = string_char_at(this.originalstring, this.stringpos);

      if (this.ch === "S") {
        this.stringpos++;
        sfxtype = string_char_at(this.originalstring, this.stringpos);

        if (sfxtype == "+") {
          this.sound_enable = 1;
        } else if (sfxtype == "-") {
          this.sound_enable = 0;
        } else {
          sfx = -4;

          if (sfxtype == "p") {
            sfx = snd_phone;
          }

          if (sfx != -4) {
            snd_play(sfx);
          }
        }
      } else if (this.ch == "z") {
        this.stringpos++;
        advance--;

        if (this.sound_enable) {
          dosound = 1;
        }
      } else if (
        this.ch === "E" ||
        this.ch === "F" ||
        this.ch === "M" ||
        this.ch === "T" ||
        this.ch === "*"
      ) {
        this.stringpos++;
      }
    } else if (this.ch !== "/" || this.ch !== "%" || this.ch !== "&") {
      advance--;

      if (this.sound_enable) {
        dosound = 1;
      }
    }
  }

  this.alarm[0] = delay;

  if (dosound) {
    if (this.txtsound === 56) {
      snd_stop(snd_mtt1);
      snd_stop(snd_mtt2);
      snd_stop(snd_mtt3);
      snd_stop(snd_mtt4);
      snd_stop(snd_mtt5);
      snd_stop(snd_mtt6);
      snd_stop(snd_mtt7);
      snd_stop(snd_mtt8);
      snd_stop(snd_mtt9);
      rnsound = floor(random(9));

      switch (rnsound) {
        case 0:
          snd_play(snd_mtt1);
          break;

        case 1:
          snd_play(snd_mtt2);
          break;

        case 2:
          snd_play(snd_mtt3);
          break;

        case 3:
          snd_play(snd_mtt4);
          break;

        case 4:
          snd_play(snd_mtt5);
          break;

        case 5:
          snd_play(snd_mtt6);
          break;

        case 6:
          snd_play(snd_mtt7);
          break;

        case 7:
          snd_play(snd_mtt8);
          break;

        case 8:
          snd_play(snd_mtt9);
          break;
      }
    } else if (this.txtsound === 71) {
      snd_stop(snd_wngdng1);
      snd_stop(snd_wngdng2);
      snd_stop(snd_wngdng3);
      snd_stop(snd_wngdng4);
      snd_stop(snd_wngdng5);
      snd_stop(snd_wngdng6);
      snd_stop(snd_wngdng7);
      rnsound = floor(random(7));

      switch (rnsound) {
        case 0:
          snd_play(snd_wngdng1);
          break;

        case 1:
          snd_play(snd_wngdng2);
          break;

        case 2:
          snd_play(snd_wngdng3);
          break;

        case 3:
          snd_play(snd_wngdng4);
          break;

        case 4:
          snd_play(snd_wngdng5);
          break;

        case 5:
          snd_play(snd_wngdng6);
          break;

        case 6:
          snd_play(snd_wngdng7);
          break;
      }
    } else if (this.txtsound === 65) {
      snd_stop(snd_tem);
      snd_stop(snd_tem2);
      snd_stop(snd_tem3);
      snd_stop(snd_tem4);
      snd_stop(snd_tem5);
      snd_stop(snd_tem6);
      rnsound = floor(random(6));

      switch (rnsound) {
        case 0:
          snd_play(snd_tem);
          break;

        case 1:
          snd_play(snd_tem2);
          break;

        case 2:
          snd_play(snd_tem3);
          break;

        case 3:
          snd_play(snd_tem4);
          break;

        case 4:
          snd_play(snd_tem5);
          break;

        case 5:
          snd_play(snd_tem6);
          break;
      }
    } else {
      this.ch = string_char_at(this.originalstring, this.stringpos);

      if (this.ch !== " " && this.ch !== "　") {
        snd_stop(this.txtsound);
        snd_play(this.txtsound);
      }
    }
  }
}

function updateGamemakerFunctions() {
  updateAlarms.call(this);

  this.image_index += this.image_speed;
  if (this.image_index >= this.image_number) {
    this.image_index -= this.image_number;
  }

  if (this.should_destroy) {
    instance_destroy(this);
  }
}

function beginStep() {
  if (this.shake > 38) {
    this.speed = 2;
    this.direction += 20;
  } else if (this.shake === 42) {
    this.speed = 4;
    this.direction -= 19;
  }

  if (this.halt === 3 || this.dfy === 1) {
    instance_destroy(this);
  }
}

function step() {
  if (control_check_pressed(0) === true) {
    this.user0();
  }
}

function user0() {
  if (this.halt === 1) {
    this.stringno++;
    this.originalstring = scr_replace_buttons_pc(this.mystring[this.stringno]);
    this.stringpos = 0;
    this.halt = 0;
    this.alarm[0] = this.textspeed;
  } else if (this.halt === 2) {
    control_clear(0);
    instance_destroy(this);
  } else if (this.halt === 4) {
    global.myfight = 0;
    global.mnfight = 1;
    control_clear(0);
    instance_destroy(this);
  }
}

function user1() {
  if (global.inbattle === 0) {
    if (!instance_exists(obj_choicer)) {
      choicer = instance_create(0, 0, obj_choicer);
      choicer.creator = "OBJ_WRITER";
    }

    this.halt = 5;
  }
}

function draw() {
  let myx = 0;
  let myy = 0;
  let offsetx = 0;
  let offsety = 0;

  if (this.vtext) myx = this.writingxend - this.vspacing;
  else myx = this.writingx;

  myy = this.writingy;

  let halfsize = 0;

  for (let n = 1; n <= this.stringpos; n++) {
    this.ch = string_char_at(this.originalstring, n);
    this.myletter = "";

    if (this.ch == "^" && string_char_at(this.originalstring, n + 1) !== "0") {
      n++;
    } else if (this.ch == "\\") {
      n++;
      this.ch = string_char_at(this.originalstring, n);

      if (this.ch == "R") {
        this.mycolor = "#FF0000";
      } else if (this.ch == "G") {
        this.mycolor = "#00FF00";
      } else if (this.ch == "W") {
        this.mycolor = "#FFFFFF";
      } else if (this.ch == "Y") {
        this.mycolor = "#FFFF00";
      } else if (this.ch == "X") {
        this.mycolor = "#000000";
      } else if (this.ch == "B") {
        this.mycolor = "#0000FF";
      } else if (this.ch == "O") {
        this.mycolor = "#40853F";
      } else if (this.ch == "L") {
        this.mycolor = "#FD61BE";
      } else if (this.ch == "P") {
        this.mycolor = "#FF00FF";
      } else if (this.ch == "p") {
        this.mycolor = "#D4AFFF";
      } else if (this.ch == "C") {
        this.user1();
      } else if (this.ch == "M") {
        n++;
        this.ch = string_char_at(this.originalstring, n);
        global.flag[20] = real(this.ch);
      } else if (this.ch == "E") {
        n++;
        this.ch = string_char_at(this.originalstring, n);
        global.faceemotion = real(this.ch);
      } else if (this.ch == "F") {
        n++;
        this.ch = string_char_at(this.originalstring, n);
        global.facechoice = real(this.ch);
        global.facethis.change = 1;
      } else if (this.ch == "S") {
        n++;
      } else if (this.ch == "T") {
        n++;
        var newtyper = string_char_at(this.originalstring, n);

        if (newtyper == "-") {
          halfsize = 1;
        } else if (newtyper == "+") {
          halfsize = 0;
        } else {
          if (newtyper == "T") global.typer = 4;

          if (newtyper == "t") global.typer = 48;

          if (newtyper == "0") global.typer = 5;

          if (newtyper == "S") global.typer = 10;

          if (newtyper == "F") global.typer = 16;

          if (newtyper == "s") global.typer = 17;

          if (newtyper == "P") global.typer = 18;

          if (newtyper == "M") global.typer = 27;

          if (newtyper == "U") global.typer = 37;

          if (newtyper == "A") global.typer = 47;

          if (newtyper == "a") global.typer = 60;

          if (newtyper == "R") global.typer = 76;

          SCR_TEXTTYPE(global.typer);
          global.facechange = 1;
        }
      } else if (this.ch == "z") {
        n++;
        var sym = real(string_char_at(this.originalstring, n));

        if (sym == 4) {
          var sym_s = "spr_punchcard";
          draw_sprite_ext(
            sym_s,
            0,
            myx + (random(this.shake) - this.shake / 2),
            myy + 10 + (random(this.shake) - this.shake / 2),
            2,
            2,
            0,
            c_white,
            1
          );
        }
      } else if (this.ch == "*") {
        n++;
        this.ch = string_char_at(this.originalstring, n);
        var icontype = 0;

        if (this.myfont == fnt_papyrus) icontype = 1;

        var sprite = scr_getbuttonsprite(this.ch, icontype);

        if (sprite != -4) {
          var spritex = myx;
          var spritey = myy;

          if (this.shake > 38) {
            if (this.shake == 39) {
              direction += 10;
              spritex += hspeed;
              spritey += vspeed;
            } else if (this.shake == 40) {
              spritex += hspeed;
              spritey += vspeed;
            } else if (this.shake == 41) {
              direction += 10 * n;
              spritex += hspeed;
              spritey += vspeed;
              direction -= 10 * n;
            } else if (this.shake == 42) {
              direction += 20 * n;
              spritex += hspeed;
              spritey += vspeed;
              direction -= 20 * n;
            } else if (this.shake == 43) {
              direction += 30 * n;
              spritex += hspeed * 0.7 + 10;
              spritey += vspeed * 0.7;
              direction -= 30 * n;
            }
          } else if (!instance_exists(obj_papdate)) {
            spritex += random(this.shake) - this.shake / 2;
            spritey += random(this.shake) - this.shake / 2;
          }

          var icon_scale = 1;

          if (this.myfont == fnt_main) icon_scale = 2;

          if (this.myfont == fnt_main || this.myfont == fnt_maintext)
            spritey += 1 * icon_scale;

          if (this.myfont == fnt_papyrus && icontype == 1)
            spritey += floor((16 - sprite_get_height(sprite)) / 2);

          if (this.vtext) {
            draw_sprite_ext(
              sprite,
              0,
              spritex - sprite_get_width(sprite),
              spritey,
              icon_scale,
              icon_scale,
              0,
              c_white,
              1
            );
            myy += (sprite_get_height(sprite) + 1) * icon_scale;
          } else {
            draw_sprite_ext(
              sprite,
              0,
              spritex,
              spritey,
              icon_scale,
              icon_scale,
              0,
              c_white,
              1
            );
            myx += (sprite_get_width(sprite) + 1) * icon_scale;
          }
        }
      } else if (this.ch == ">") {
        n++;
        var choiceindex = real(string_char_at(this.originalstring, n));

        if (choiceindex == 1) {
          myx = 196;
        } else {
          myx = 100;

          if (this.myfont == fnt_ja_comicsans_big) myx += 11;
        }

        if (final_view_wview[view_current] == 640) myx *= 2;

        myx += final_view_xview[view_current];
      }
    } else if (this.ch == "&") {
      if (this.vtext) {
        myx -= this.vspacing;
        myy = this.writingy;
      } else {
        myx = this.writingx;
        myy += this.vspacing;
      }
    } else if (this.ch == "/") {
      this.halt = 1;
      var nextch = string_char_at(this.originalstring, n + 1);

      if (nextch == "%") this.halt = 2;
      else if (
        nextch == "^" &&
        string_char_at(this.originalstring, n + 2) != "0"
      )
        this.halt = 4;
      else if (nextch == "*") this.halt = 6;

      break;
    } else if (this.ch == "%") {
      if (string_char_at(this.originalstring, n + 1) == "%") {
        this.should_destroy = true;
        break;
      }

      this.stringno++;
      this.originalstring = scr_replace_buttons_pc(
        this.mystring[this.stringno]
      );
      this.stringpos = 0;
      myx = this.writingx;
      myy = this.writingy;
      this.alarm[0] = this.textspeed;
      break;
    } else {
      this.myletter = string_char_at(this.originalstring, n);

      if (this.myletter == "^") n++;

      if (!this.vtext && myx > this.writingxend)
        script_execute.call(this, SCR_NEWLINE);

      var letterx = myx;
      offsetx = 0;
      offsety = 0;
      var halfscale = 1;

      if (halfsize) {
        halfscale = 0.5;

        if (this.vtext) offsetx += this.vspacing * 0.33;
        else offsety += this.vspacing * 0.33;
      }

      if (global.language == "en") {
        if (global.typer == 18) {
          if (this.myletter == "l" || this.myletter == "i") letterx += 2;

          if (this.myletter == "I") letterx += 2;

          if (this.myletter == "!") letterx += 2;

          if (this.myletter == ".") letterx += 2;

          if (this.myletter == "S") letterx += 1;

          if (this.myletter == "?") letterx += 2;

          if (this.myletter == "D") letterx += 1;

          if (this.myletter == "A") letterx += 1;

          if (this.myletter == "'") letterx += 1;
        }
      } else if (global.language == "ja") {
        if (
          this.vtext &&
          (this.myfont == fnt_ja_papyrus || this.myfont == fnt_ja_papyrus_btl)
        ) {
          if (
            myy == writingy &&
            (this.myletter == "「" || this.myletter == "『")
          )
            myy -= round(
              (string_width(this.myletter) / 2) * this.htextscale * halfscale
            );
        } else if (
          this.myfont == fnt_ja_maintext ||
          this.myfont == fnt_ja_main
        ) {
          var unit = this.htextscale * halfscale;

          if (this.myfont == fnt_ja_main) unit *= 2;

          if (ord(this.myletter) < 1024 || ord(this.myletter) == 8211) {
            if (n > 1) {
              var lastch = ord(string_char_at(this.originalstring, n - 1));

              if (
                lastch >= 1024 &&
                lastch < 65281 &&
                lastch != 8211 &&
                lastch != 12288
              )
                letterx += unit;
            }
          }
        }
      }

      scr_setfont(this.myfont);
      draw_set_color(this.mycolor);
      var angle = 0;

      if (this.vtext) angle = -90;
      else angle = 0;

      if (this.shake > 38) {
        if (this.shake == 39) {
          direction += 10;
          offsetx += hspeed;
          offsety += vspeed;
        } else if (this.shake == 40) {
          offsetx += hspeed;
          offsety += vspeed;
        } else if (this.shake == 41) {
          direction += 10 * n;
          offsetx += hspeed;
          offsety += vspeed;
          direction -= 10 * n;
        } else if (this.shake == 42) {
          direction += 20 * n;
          offsetx += hspeed;
          offsety += vspeed;
          direction -= 20 * n;
        } else if (this.shake == 43) {
          direction += 30 * n;
          offsetx += hspeed * 0.7 + 10;
          offsety += vspeed * 0.7;
          direction -= 30 * n;
        }
      } else if (this.shake !== 0) {
        offsetx += random(this.shake) - this.shake / 2;
        offsety += random(this.shake) - this.shake / 2;
      } else {
        offsetx = 0;
        offsety = 0;
      }

      var display_scale =
        surface_get_width("application_surface") /
        final_view_wview[view_current];
      var finalx = round((letterx + offsetx) * display_scale) / display_scale;
      var finaly = round((myy + offsety) * display_scale) / display_scale;
      draw_text_transformed(
        finalx,
        finaly,
        this.myletter,
        this.htextscale * halfscale,
        this.vtextscale * halfscale,
        angle
      );
      letterx += this.spacing;

      if (global.language == "en") {
        if (this.myfont == fnt_comicsans) {
          if (this.myletter == "w") letterx += 2;

          if (this.myletter == "m") letterx += 2;

          if (this.myletter == "i") letterx -= 2;

          if (this.myletter == "l") letterx -= 2;

          if (this.myletter == "s") letterx -= 1;

          if (this.myletter == "j") letterx -= 1;
        } else if (this.myfont == fnt_papyrus) {
          if (this.myletter == "D") letterx += 1;

          if (this.myletter == "Q") letterx += 3;

          if (this.myletter == "M") letterx += 1;

          if (this.myletter == "L") letterx -= 1;

          if (this.myletter == "K") letterx -= 1;

          if (this.myletter == "C") letterx += 1;

          if (this.myletter == ".") letterx -= 3;

          if (this.myletter == "!") letterx -= 3;

          if (this.myletter == "O" || this.myletter == "W") letterx += 2;

          if (this.myletter == "I") letterx -= 6;

          if (this.myletter == "T") letterx -= 1;

          if (this.myletter == "P") letterx -= 2;

          if (this.myletter == "R") letterx -= 2;

          if (this.myletter == "A") letterx += 1;

          if (this.myletter == "H") letterx += 1;

          if (this.myletter == "B") letterx += 1;

          if (this.myletter == "G") letterx += 1;

          if (this.myletter == "F") letterx -= 1;

          if (this.myletter == "?") letterx -= 3;

          if (this.myletter == "'") letterx -= 6;

          if (this.myletter == "J") letterx -= 1;
        }
      } else if (global.language == "ja") {
        if (this.vtext) {
          myy += round(
            string_width(this.myletter) * this.htextscale * halfscale
          );
        } else if (this.myletter == " " || ord(this.myletter) >= 65377) {
          letterx -= floor(this.spacing / 2);
        } else if (ord(this.myletter) < 1024 || ord(this.myletter) == 8211) {
          if (
            this.myfont == fnt_ja_comicsans ||
            this.myfont == fnt_ja_comicsans_big
          )
            letterx -= floor(this.spacing * 0.3);
          else letterx -= floor(this.spacing * 0.4);
        }
      }

      if (!this.vtext) {
        if (halfsize) myx = round(myx + (letterx - myx) / 2);
        else myx = letterx;
      }
    }
  }
}

function roomStart() {
  script_execute.call(this, SCR_TEXT, global.msc);
  SCR_TEXTTYPE.call(this, global.typer, 0, 0);
  this.writingx = round(this.writingx);
  this.writingy = round(this.writingy);
  this.x = round(this.x);
  this.y = round(this.y);
  this.ch = "";

  this.mystring = [];

  for (let n = 0; global.msg[n] !== "%%%"; n++) {
    this.mystring[n] = global.msg[n];
  }

  this.originalstring = scr_replace_buttons_pc(this.mystring[0]);

  this.alarm[0] = this.textspeed;
  this.writingx = this.x + this.writingx;
  this.writingy = this.y + this.writingy;
}

export {
  create,
  updateAlarms,
  updateGamemakerFunctions,
  beginStep,
  step,
  user0,
  user1,
  draw,
  roomStart,
  alarm0,
};
