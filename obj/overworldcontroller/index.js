import {
  _with,
  draw_set_color,
  draw_sprite,
  draw_sprite_ext,
  draw_text,
  draw_text_transformed,
  floor,
  ini_read_real,
  ini_read_string,
  instance_exists,
  instances,
  keyboard_check_pressed,
  round,
  script_execute,
  string,
  string_width,
} from "/imports/assets/gamemakerFunctions.js";
import {
  ossafe_fill_rectangle,
  ossafe_ini_close,
  ossafe_ini_open,
  scr_drawtext_centered,
  scr_gettext,
  scr_roomname,
  scr_save,
  scr_setfont,
  snd_play,
  substr,
} from "/imports/customFunctions.js";
import {
  control_check_pressed,
  control_clear,
  vk_down,
  vk_left,
  vk_right,
  vk_up,
} from "/imports/input.js";
import { view_current, view_xview, view_yview } from "/imports/view.js";
import {
  c_black,
  c_gray,
  c_white,
  c_yellow,
  fnt_maintext,
  fnt_small,
  snd_save,
  snd_select,
  snd_squeak,
} from "/imports/assets.js";
import global from "/imports/assets/global.js";

import * as obj_dialoguer from "/obj/dialoguer/index.js";
import * as obj_maincharaReal from "/obj/mainchara/index.js";

function create() {
  const alarm = new Array(12).fill(-1);

  // create code
  const obj_mainchara = instances.get(obj_maincharaReal)[0];

  return {
    name: "overworldcontroller", // sprite name
    depth: -500, // object depth
    image_xscale: 1, // sprite scale
    image_yscale: 1, // sprite scale
    x: 0, // object x. this is set by room
    y: 0, // object y. this is set by room
    image_alpha: 1, // sprite alpha
    image_index: 0, // sprite frame index
    image_speed: 0, // sprite frame speed
    image_number: 0, // sprite frame number
    sprite_index: "spr_heartgtfo", // sprite object
    visible: false, // sprite visibility

    alarm: alarm, // alarm array

    // any variables assigned inside create code
    selected3: 0,
    saved: 0,
    buffer: 0,
    obj_mainchara,

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
  if (this.visible === true)
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

function draw() {
  this.buffer += 1;

  if (global.interact == 5) {
    this.currentmenu = global.menuno;

    if (global.menuno < 6) this.currentspot = global.menucoord[global.menuno];

    this.xx = view_xview[view_current];
    this.yy = view_yview[view_current] + 10;
    this.moveyy = this.yy;

    if (this.obj_mainchara.y > this.yy + 120) this.moveyy += 135;

    if (global.menuno != 4) {
      draw_set_color(c_white);
      ossafe_fill_rectangle(
        16 + this.xx,
        16 + this.moveyy,
        86 + this.xx,
        70 + this.moveyy
      );
      ossafe_fill_rectangle(
        16 + this.xx,
        74 + this.yy,
        86 + this.xx,
        147 + this.yy
      );

      if (global.menuno == 1 || global.menuno == 5 || global.menuno == 6)
        ossafe_fill_rectangle(
          94 + this.xx,
          16 + this.yy,
          266 + this.xx,
          196 + this.yy
        );

      if (global.menuno == 2) {
        var xend = 266;

        if (global.language == "ja") xend += 9;

        ossafe_fill_rectangle(
          94 + this.xx,
          16 + this.yy,
          xend + this.xx,
          224 + this.yy
        );
      }

      if (global.menuno == 3)
        ossafe_fill_rectangle(
          94 + this.xx,
          16 + this.yy,
          266 + this.xx,
          150 + this.yy
        );

      if (global.menuno == 7)
        ossafe_fill_rectangle(
          94 + this.xx,
          16 + this.yy,
          266 + this.xx,
          216 + this.yy
        );

      draw_set_color(c_black);
      ossafe_fill_rectangle(
        19 + this.xx,
        19 + this.moveyy,
        83 + this.xx,
        67 + this.moveyy
      );
      ossafe_fill_rectangle(
        19 + this.xx,
        77 + this.yy,
        83 + this.xx,
        144 + this.yy
      );

      if (global.menuno == 1 || global.menuno == 5 || global.menuno == 6)
        ossafe_fill_rectangle(
          97 + this.xx,
          19 + this.yy,
          263 + this.xx,
          193 + this.yy
        );

      if (global.menuno == 2) {
        var xend = 263;

        if (global.language == "ja") xend += 9;

        ossafe_fill_rectangle(
          97 + this.xx,
          19 + this.yy,
          xend + this.xx,
          221 + this.yy
        );
      }

      if (global.menuno == 3)
        ossafe_fill_rectangle(
          97 + this.xx,
          19 + this.yy,
          263 + this.xx,
          147 + this.yy
        );

      if (global.menuno == 7)
        ossafe_fill_rectangle(
          97 + this.xx,
          19 + this.yy,
          263 + this.xx,
          213 + this.yy
        );

      draw_set_color(c_white);
      scr_setfont(fnt_small, 1);
      var numpos = 23 + this.xx + "LV    ".length;
      draw_text(23 + this.xx, 40 + this.moveyy, "LV", 1);
      draw_text(numpos, 40 + this.moveyy, "    " + string(global.lv), 1);
      draw_text(23 + this.xx, 49 + this.moveyy, "HP", 1);
      draw_text(
        numpos,
        49 + this.moveyy,
        "    " + string(global.hp) + "/" + string(global.maxhp),
        1
      );
      draw_text(23 + this.xx, 58 + this.moveyy, "G", 1);
      draw_text(numpos, 58 + this.moveyy, "    " + string(global.gold), 1);
      scr_setfont(fnt_maintext, 0);
      var name0_x = 23 + this.xx;
      var name0_y = 20 + this.moveyy;
      var name0_scale = 1;

      draw_text_transformed(
        name0_x,
        name0_y,
        global.charname,
        name0_scale,
        name0_scale,
        0
      );
      scr_setfont(fnt_maintext, 0);
      var xx0 = this.xx;

      if (global.language == "ja") xx0 -= 2;

      if (global.item[0] == 0) draw_set_color(c_gray);

      if (global.menuchoice[0] == 1)
        draw_text(42 + xx0, 84 + this.yy, scr_gettext("field_menu_item"));

      draw_set_color(c_white);

      if (global.menuchoice[1] == 1)
        draw_text(42 + this.xx, 102 + this.yy, scr_gettext("field_menu_stat"));

      if (global.menuchoice[2] == 1)
        draw_text(42 + this.xx, 120 + this.yy, scr_gettext("field_menu_cell"));

      if (global.menuno == 1 || global.menuno == 5) {
        for (let i = 0; i < 8; i += 1)
          draw_text(116 + this.xx, 30 + this.yy + i * 16, global.itemname[i]);

        draw_text(116 + this.xx, 170 + this.yy, scr_gettext("item_menu_use"));
        draw_text(
          116 + this.xx + 48,
          170 + this.yy,
          scr_gettext("item_menu_info")
        );
        draw_text(
          116 + this.xx + 105,
          170 + this.yy,
          scr_gettext("item_menu_drop")
        );
      }
    }

    if (global.menuno == 3) {
      for (let i = 0; i < 7; i += 1)
        draw_text(116 + this.xx, 30 + this.yy + i * 16, global.phonename[i]);
    }

    if (global.menuno == 6) {
      scr_itemname();

      for (let i = 0; i < 8; i += 1)
        draw_text(116 + this.xx, 30 + this.yy + i * 16, global.itemname[i]);
    }

    if (global.menuno == 7) {
      scr_storagename(300);

      for (let i = 0; i < 10; i += 1)
        draw_text(116 + this.xx, 30 + this.yy + i * 16, global.itemname[i]);
    }

    if (global.menuno == 2) {
      var stat_x = 108 + this.xx;

      if (global.language == "ja") stat_x -= 3;

      var exp_x = stat_x + 84;
      var kills_x = exp_x;
      var name_y = 32 + this.yy;
      var lv_y = 62 + this.yy;
      var hp_y = 78 + this.yy;
      var at_y = 110 + this.yy;
      var df_y = 126 + this.yy;
      var weapon_y = 156 + this.yy;
      var armor_y = 172 + this.yy;
      var gold_y = 192 + this.yy;
      var kills_y = 192 + this.yy;

      if (global.language == "ja") {
        weapon_y -= 2;
        gold_y += 2;
        kills_y += 2;
      }

      draw_text(stat_x, name_y, scr_gettext("stat_menu_name"));
      draw_text(stat_x, lv_y, scr_gettext("stat_menu_lv", string(global.lv)));
      draw_text(
        stat_x,
        hp_y,
        scr_gettext("stat_menu_hp", string(global.hp), string(global.maxhp))
      );
      draw_text(
        stat_x,
        at_y,
        scr_gettext(
          "stat_menu_at",
          string(global.at - 10),
          string(global.wstrength)
        )
      );
      draw_text(
        stat_x,
        df_y,
        scr_gettext("stat_menu_df", string(global.df - 10), string(global.adef))
      );
      draw_text(
        stat_x,
        weapon_y,
        scr_gettext(
          "stat_menu_weapon",
          scr_gettext("item_name_" + string(global.weapon))
        )
      );
      var armorname = string(global.armor);

      if (global.armor === 64) {
        armorname = scr_gettext("stat_armor_temmie");
      }

      draw_text(
        stat_x,
        armor_y,
        scr_gettext("stat_menu_armor", scr_gettext("item_name_" + armorname))
      );
      draw_text(stat_x, gold_y, scr_gettext("stat_menu_gold"));

      if (global.kills > 20)
        draw_text(
          kills_x,
          kills_y,
          scr_gettext("stat_menu_kills", string(global.kills))
        );

      if (global.charname.length >= 7) {
        var x2 = 192 + this.xx;
        var y2 = 32 + this.yy;

        draw_text_transformed(x2, y2, "Easy to#change,#huh?");
      }

      draw_text(exp_x, at_y, "EXP: " + String(global.xp));

      if (global.lv == 1) this.nextlevel = 10 - global.xp;

      if (global.lv == 2) this.nextlevel = 30 - global.xp;

      if (global.lv == 3) this.nextlevel = 70 - global.xp;

      if (global.lv == 4) this.nextlevel = 120 - global.xp;

      if (global.lv == 5) this.nextlevel = 200 - global.xp;

      if (global.lv == 6) this.nextlevel = 300 - global.xp;

      if (global.lv == 7) this.nextlevel = 500 - global.xp;

      if (global.lv == 8) this.nextlevel = 800 - global.xp;

      if (global.lv == 9) this.nextlevel = 1200 - global.xp;

      if (global.lv == 10) this.nextlevel = 1700 - global.xp;

      if (global.lv == 11) this.nextlevel = 2500 - global.xp;

      if (global.lv == 12) this.nextlevel = 3500 - global.xp;

      if (global.lv == 13) this.nextlevel = 5000 - global.xp;

      if (global.lv == 14) this.nextlevel = 7000 - global.xp;

      if (global.lv == 15) this.nextlevel = 10000 - global.xp;

      if (global.lv == 16) this.nextlevel = 15000 - global.xp;

      if (global.lv == 17) this.nextlevel = 25000 - global.xp;

      if (global.lv == 18) this.nextlevel = 50000 - global.xp;

      if (global.lv == 19) this.nextlevel = 99999 - global.xp;

      if (global.lv >= 20) this.nextlevel = 0;

      draw_text(exp_x, df_y, "NEXT: " + string(this.nextlevel), 0);
    }

    if (global.menuno == 4) {
      this.iniread = ossafe_ini_open("undertale.ini");
      this.name = ini_read_string("General", "Name", "EMPTY");
      this.love = ini_read_real("General", "Love", 0);
      this.time = ini_read_real("General", "Time", 1);
      this.kills = ini_read_real("General", "Kills", 0);
      this.roome = ini_read_real("General", "Room", 0);
      ossafe_ini_close();
      scr_setfont(fnt_maintext, 0);
      draw_set_color(c_white);
      ossafe_fill_rectangle(
        54 + this.xx,
        49 + this.yy,
        265 + this.xx,
        135 + this.yy
      );
      draw_set_color(c_black);
      ossafe_fill_rectangle(
        57 + this.xx,
        52 + this.yy,
        262 + this.xx,
        132 + this.yy
      );
      draw_set_color(c_white);

      if (global.menucoord[4] == 2) draw_set_color(c_yellow);

      this.minutes = floor(this.time / 1800);
      this.seconds = round((this.time / 1800 - this.minutes) * 60);

      if (this.seconds == 60) this.seconds = 59;

      if (this.seconds < 10) this.seconds = "0" + string(this.seconds);

      var roomname = scr_roomname(this.roome);
      var lvtext = scr_gettext("save_menu_lv", string(this.love));
      var timetext = scr_gettext(
        "save_menu_time",
        string(this.minutes),
        string(this.seconds)
      );
      var namesize = string_width(substr(this.name, 1, 6));
      var lvsize = string_width(lvtext);
      var timesize = string_width(timetext);
      var x_center = this.xx + 160;
      var lvpos = round(x_center + namesize / 2 - timesize / 2 - lvsize / 2);
      var namepos = 70 + this.xx;
      var timepos = 250 + this.xx;

      if (global.language == "ja") {
        namepos -= 6;
        timepos += 6;
      }

      draw_text(namepos, 60 + this.yy, this.name);
      draw_text(lvpos, 60 + this.yy, lvtext);
      draw_text(timepos - timesize, 60 + this.yy, timetext);

      if (global.language == "ja")
        scr_drawtext_centered(x_center, 80 + this.yy, roomname);
      else draw_text(namepos, 80 + this.yy, roomname);

      var savepos = this.xx + 71;
      var returnpos = this.xx + 161;

      if (global.language == "ja") {
        savepos = this.xx + 78;
        returnpos = this.xx + 173;
      }

      if (global.menucoord[4] == 0)
        draw_sprite("spr_heartsmall", 0, savepos, this.yy + 113);

      if (global.menucoord[4] == 1)
        draw_sprite("spr_heartsmall", 0, returnpos, this.yy + 113);

      if (global.menucoord[4] < 2) {
        draw_text(savepos + 14, this.yy + 110, "Save");
        draw_text(returnpos + 14, this.yy + 110, "Return");
      } else {
        draw_text(this.xx + 85, this.yy + 110, "File saved.");

        if (control_check_pressed(0)) {
          global.menuno = -1;
          global.interact = 0;
          global.menucoord[4] = 0;
          control_clear(0);
        }
      }

      if (keyboard_check_pressed(vk_left) || keyboard_check_pressed(vk_right)) {
        if (global.menucoord[4] < 2) {
          if (global.menucoord[4] == 1) global.menucoord[4] = 0;
          else global.menucoord[4] = 1;
        }
      }

      if (control_check_pressed(0) && global.menucoord[4] == 0) {
        snd_play(snd_save);
        script_execute.call(this, scr_save);
        global.menucoord[4] = 2;
        control_clear(0);
      }

      if (control_check_pressed(0) && global.menucoord[4] == 1) {
        global.menuno = -1;
        global.interact = 0;
        global.menucoord[4] = 0;
        control_clear(0);
      }

      if (control_check_pressed(1)) {
        global.menuno = -1;
        global.interact = 0;
        global.menucoord[4] = 0;
        control_clear(1);
      }
    }

    if (global.menuno == 0) {
      var heart_y = 88;

      if (global.language == "ja") heart_y -= 1;

      draw_sprite(
        "spr_heartsmall",
        0,
        28 + this.xx,
        heart_y + this.yy + 18 * global.menucoord[0]
      );
    }

    if (global.menuno == 1) {
      var heart_y = 34;

      if (global.language == "ja") heart_y -= 1;

      draw_sprite(
        "spr_heartsmall",
        0,
        104 + this.xx,
        heart_y + this.yy + 16 * global.menucoord[1]
      );
    }

    if (global.menuno == 3) {
      var heart_y = 34;

      if (global.language == "ja") heart_y -= 1;

      draw_sprite(
        "spr_heartsmall",
        0,
        104 + this.xx,
        heart_y + this.yy + 16 * global.menucoord[3]
      );
    }

    if (global.menuno == 6) {
      var heart_y = 34;

      if (global.language == "ja") heart_y -= 1;

      draw_sprite(
        "spr_heartsmall",
        0,
        104 + this.xx,
        heart_y + this.yy + 16 * global.menucoord[6]
      );
    }

    if (global.menuno == 7) {
      var heart_y = 34;

      if (global.language == "ja") heart_y -= 1;

      draw_sprite(
        "spr_heartsmall",
        0,
        104 + this.xx,
        heart_y + this.yy + 16 * global.menucoord[7]
      );
    }

    if (global.menuno == 5) {
      var heart_y = 174;

      if (global.language == "ja") heart_y -= 1;

      if (global.menucoord[5] == 0)
        draw_sprite(
          "spr_heartsmall",
          0,
          104 + this.xx + 45 * global.menucoord[5],
          heart_y + this.yy
        );

      if (global.menucoord[5] == 1)
        draw_sprite(
          "spr_heartsmall",
          0,
          104 + this.xx + (45 * global.menucoord[5] + 3),
          heart_y + this.yy
        );

      if (global.menucoord[5] == 2)
        draw_sprite(
          "spr_heartsmall",
          0,
          104 + this.xx + (45 * global.menucoord[5] + 15),
          heart_y + this.yy
        );
    }

    if (control_check_pressed(0)) {
      if (global.menuno == 5) {
        if (global.menucoord[5] == 0) {
          global.menuno = 9;
          script_execute.call(
            this,
            scr_itemuseb,
            global.menucoord[1],
            global.item[global.menucoord[1]]
          );
        }

        if (global.menucoord[5] == 1) {
          global.menuno = 9;
          script_execute.call(
            this,
            scr_itemdesc,
            global.item[global.menucoord[1]]
          );
          script_execute.call(this, scr_writetext, 0, "x", 0, 0);
        }

        if (global.menucoord[5] == 2) {
          global.menuno = 9;
          this.dontthrow = 0;

          if (
            global.item[global.menucoord[1]] != 23 &&
            global.item[global.menucoord[1]] != 27 &&
            global.item[global.menucoord[1]] != 54 &&
            global.item[global.menucoord[1]] != 56 &&
            global.item[global.menucoord[1]] != 57
          ) {
            script_execute.call(this, scr_writetext, 12, "x", 0, 0);
          } else {
            if (global.item[global.menucoord[1]] == 23)
              script_execute.call(this, scr_writetext, 23, "x", 0, 0);

            if (global.item[global.menucoord[1]] == 27) {
              script_execute.call(
                this,
                scr_writetext,
                0,
                "* (You put the dog on the&  ground.)/%%"
              );

              if (instance_exists(obj_rarependant)) {
                _with(obj_rarependant, function () {
                  this.con = 1;
                });
              }
            }

            if (global.item[global.menucoord[1]] == 54) {
              script_execute.call(
                this,
                scr_writetext,
                0,
                "* (You threw the Bad Memory&  away.^1)&* (But it came back.)/%%"
              );
              this.dontthrow = 1;
            }

            if (global.item[global.menucoord[1]] == 56) {
              if (!instance_exists(obj_undyne_friendc)) {
                script_execute.call(
                  this,
                  scr_writetext,
                  0,
                  "* (Despite what seems like&  common sense^1, you threw&  away the letter.)/%%"
                );
                global.flag[494] = 1;
              } else {
                global.faceemotion = 1;
                script_execute.call(
                  this,
                  scr_writetext,
                  0,
                  "* Hey^1! Don't throw that&  away^1! Just deliver it!/%%"
                );
                this.dontthrow = 1;
              }
            }

            if (global.item[global.menucoord[1]] == 57) {
              script_execute.call(
                this,
                scr_writetext,
                0,
                "* (The letter is too powerful to&  throw away.^1)&* (It gets the better of you.)/%%"
              );
              this.dontthrow = 1;
            }
          }

          if (this.dontthrow == 0)
            script_execute.call(this, scr_itemshift, global.menucoord[1], 0);
        }
      }

      if (global.menuno == 3) {
        global.menuno = 9;
        script_execute.call(
          this,
          scr_itemuseb,
          global.menucoord[3],
          global.phone[global.menucoord[3]]
        );
      }

      if (global.menuno == 6) {
        global.menuno = 9;
        script_execute.call(
          this,
          scr_storageget,
          global.item[global.menucoord[6]],
          300
        );

        if (this.noroom == 0) {
          script_execute.call(this, scr_writetext, 16, "x", 0, 0);
          script_execute.call(this, scr_itemshift, global.menucoord[6], 0);
        } else {
          script_execute.call(this, scr_writetext, 19, "x", 0, 0);
        }
      }

      if (global.menuno == 7) {
        global.menuno = 9;
        script_execute.call(
          this,
          scr_itemget,
          global.flag[global.menucoord[7] + 300]
        );

        if (this.noroom == 0) {
          script_execute.call(this, scr_writetext, 17, "x", 0, 0);
          scr_storageshift(global.menucoord[7], 0, 300);
        } else {
          script_execute.call(this, scr_writetext, 18, "x", 0, 0);
        }
      }

      if (global.menuno == 1) {
        global.menuno = 5;
        global.menucoord[5] = 0;
      }

      if (global.menuno == 0) global.menuno += global.menucoord[0] + 1;

      if (global.menuno == 3) {
        script_execute.call(this, scr_phonename);
        global.menucoord[3] = 0;
      }

      if (global.menuno == 1) {
        if (global.item[0] != 0) {
          global.menucoord[1] = 0;
          script_execute.call(this, scr_itemname);
        } else {
          global.menuno = 0;
        }
      }
    }

    if (keyboard_check_pressed(vk_up)) {
      if (global.menuno == 0) {
        if (global.menucoord[0] != 0) global.menucoord[0] -= 1;
      }

      if (global.menuno == 1) {
        if (global.menucoord[1] != 0) global.menucoord[1] -= 1;
      }

      if (global.menuno == 3) {
        if (global.menucoord[3] != 0) global.menucoord[3] -= 1;
      }

      if (global.menuno == 6) {
        if (global.menucoord[6] != 0) global.menucoord[6] -= 1;
      }

      if (global.menuno == 7) {
        if (global.menucoord[7] != 0) global.menucoord[7] -= 1;
      }
    }

    if (keyboard_check_pressed(vk_down)) {
      if (global.menuno == 0) {
        if (global.menucoord[0] != 2) {
          if (global.menuchoice[global.menucoord[0] + 1] != 0)
            global.menucoord[0] += 1;
        }
      }

      if (global.menuno == 1) {
        if (global.menucoord[1] != 7) {
          if (global.item[global.menucoord[1] + 1] != 0)
            global.menucoord[1] += 1;
        }
      }

      if (global.menuno == 3) {
        if (global.menucoord[3] != 7) {
          if (global.phone[global.menucoord[3] + 1] != 0)
            global.menucoord[3] += 1;
        }
      }

      if (global.menuno == 6) {
        if (global.menucoord[6] != 7) {
          if (global.item[global.menucoord[6] + 1] != 0)
            global.menucoord[6] += 1;
        }
      }

      if (global.menuno == 7) {
        if (global.menucoord[7] != 9) {
          if (global.flag[global.menucoord[7] + 301] != 0)
            global.menucoord[7] += 1;
        }
      }
    }

    if (control_check_pressed(1) && this.buffer >= 0) {
      if (global.menuno == 0) {
        global.menuno = -1;
        global.interact = 0;
      } else if (global.menuno <= 3) {
        global.menuno = 0;
      }

      if (global.menuno == 5) global.menuno = 1;
    }

    if (keyboard_check_pressed(vk_right)) {
      if (global.menuno == 5) {
        if (global.menucoord[5] != 2) global.menucoord[5] += 1;
      }
    }

    if (keyboard_check_pressed(vk_left)) {
      if (global.menuno == 5) {
        if (global.menucoord[5] != 0) global.menucoord[5] -= 1;
      }
    }

    if (control_check_pressed(2)) {
      if (global.menuno == 0) {
        global.menuno = -1;
        global.interact = 0;
      }
    }

    if (this.currentmenu < global.menuno && global.menuno != 9) {
      snd_play(snd_select);
    } else if (global.menuno >= 0 && global.menuno < 6) {
      if (this.currentspot != global.menucoord[global.menuno])
        snd_play(snd_squeak);
    }
  }

  if (global.menuno == 9 && instance_exists(obj_dialoguer) == false) {
    global.menuno = -1;
    global.interact = 0;
  }
}

export { create, updateAlarms, updateGamemakerFunctions, updateSprite, draw };
