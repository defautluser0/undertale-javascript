import {
  audio_play_sound,
  audio_sound_gain,
  audio_sound_pitch,
  audio_stop_all,
  audio_stop_sound,
  round,
  floor,
  currentFont,
  secondFont,
  thirdFont,
  surface_get_width,
  random,
  keyboard_check_pressed,
  string_delete,
  instance_create,
  draw_rectangle,
  ds_map_find_value,
  string_copy,
  string_length,
  string_char_at,
  string,
  room_get_name,
  file_exists,
  instance_exists,
  _with,
  audio_resume_sound,
  audio_pause_sound,
  ini_open,
  ini_read_real,
  ini_write_real,
  ini_close,
  audio_is_playing,
  abs,
} from "/imports/assets/gamemakerFunctions.js";
import {
  draw_text,
  draw_text_transformed,
  draw_set_font,
  draw_set_color,
  fnt_main,
  fnt_maintext,
  fnt_plain,
  fnt_plainbig,
  fnt_comicsans,
  fnt_papyrus,
  c_white,
  c_black,
  SND_TXT1,
  SND_TXT2,
  snd_txttor,
  snd_txttor2,
  snd_floweytalk1,
  snd_floweytalk2,
  snd_txtpap,
  snd_txtsans,
  snd_nosound,
  room_goto,
  c_ltgray,
  c_yellow,
  mus_cymbal,
} from "/imports/assets.js";
import { vk_down, vk_up, vk_right, vk_left, control_check_pressed, control_clear } from "/imports/input.js"
import global from "/imports/assets/global.js";
import { view_xview, view_current, view_wview } from "/imports/view.js"

import * as obj_whitefader from "/obj/whitefader/index.js";
import * as obj_persistentfader from "/obj/persistentfader/index.js";
import * as obj_face_torieltalk from "/obj/face_torieltalk/index.js";
import * as obj_torbody from "/obj/torbody/index.js";
import * as obj_face_floweytalk from "/obj/face_floweytalk/index.js";
import * as obj_face_sans from "/obj/face_sans/index.js";
import * as obj_face_papyrus from "/obj/face_papyrus/index.js";
import * as obj_face_undyne from "/obj/face_undyne/index.js";
import * as obj_face_alphys from "/obj/face_alphys/index.js";
import * as obj_face_asgore from "/obj/face_asgore/index.js";
import * as obj_face_mettaton from "/obj/face_mettaton/index.js";
import * as obj_face_asriel from "/obj/face_asriel/index.js";
import * as OBJ_WRITER from "/obj/writer/index.js";
import * as obj_fakeheart from "/obj/fakeheart/index.js"

function scr_replace_buttons_pc(str) {
  try {
    return str
      .replaceAll("*Z", "[Z]")
      .replaceAll("*X", "[X]")
      .replaceAll("*C", "[C]")
      .replaceAll("*A", "[LEFT]")
      .replaceAll("*D", "[RIGHT]");
  } catch(error) {
    console.error(error);
    return "";
  }
}

function measure_text_width_bitmap(text, xscale = 1, font) {
  let width = 0;
  for (const char of text) {
    const glyph = font.glyphs[char];
    if (glyph) {
      // glyph.shift is the advance, fallback to glyph.w + glyph.offset if missing
      const advance = glyph.shift ?? (glyph.w + (glyph.offset || 0));
      width += advance * xscale;
    } else {
      width += font.size * xscale; // fallback width
    }
  }
  return width;
}

function scr_drawtext_centered_scaled(xx, yy, text, xscale, yscale, second = 0) {
  let fontSize = currentFont.size;
  if (second === 1) {
    fontSize = secondFont.size
  } else if (second === 2) {
    fontSize = thirdFont.size;
  }

  let font = currentFont
  if (second === 1) {
    font = secondFont;
  } else if (second === 2) {
    font = thirdFont;
  }

  const display_scale = surface_get_width("application_surface") / view_wview[view_current];
  const lineheight = Math.round(fontSize * yscale);

  // Fix vertical position rounding similar to GML
  yy = Math.round(yy * display_scale) / display_scale;

  let lines = text.split("#");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const width = measure_text_width_bitmap(line, xscale, font);
    const line_x = Math.round((xx - width / 2) * display_scale) / display_scale;

    draw_text_transformed(round(line_x), yy, line, xscale, yscale, 0, second);

    yy += lineheight;
  }
}

function scr_drawtext_icons_multiline(x0, y0, str, icon_scale = 1, second = 0) {
  str = scr_replace_buttons_pc(str);
  const lineHeight = (currentFont.glyphs[" "].h);
  let xx = x0;
  let yy = y0;
  let outstr = "";

  let font = currentFont
  if (second === 1) {
    font = secondFont;
  } else if (second === 2) {
    font = thirdFont;
  }

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "#") {
      if (outstr.length > 0) {
        draw_text(xx, yy, outstr);
        outstr = "";
      }
      xx = x0;
      yy += lineHeight;  // scaled line height now
    } else if (str[i] === "\\" && str[i + 2] === "*") {
      if (outstr.length > 0) {
        draw_text(xx, yy, outstr);
        xx += round(measure_text_width_bitmap(outstr, icon_scale, font));
        outstr = "";
      }
      i += 2;
      const ch = str[i];
      const keyLabel = scr_replace_buttons_pc("*" + ch);
      draw_text_transformed(round(xx), yy, keyLabel, icon_scale, icon_scale, second);
      xx += measure_text_width_bitmap(keyLabel, icon_scale, font);
    } else {
      outstr += str[i];
    }
  }
  if (outstr.length > 0) {
    draw_text(round(xx), yy, outstr, second);
  }
}

function scr_drawtext_icons(xx, yy, str, icon_scale = 1, second = 0) {
  str = scr_replace_buttons_pc(str);

  let font = currentFont
  if (second === 1) {
    font = secondFont;
  } else if (second === 2) {
    font = thirdFont;
  }

  while (true) {
    let i = str.indexOf("*");
    if (i === -1) break;

    if (i > 0) {
      const s = str.substring(0, i);
      draw_text_transformed(xx, yy, s, icon_scale, icon_scale, second);
      xx += measure_text_width_bitmap(s, icon_scale, font);
      str = str.substring(i);
    }

    if (str.length >= 3 && str[0] === "*" && str[2]) {
      const ch = str[2];
      const keyLabel = scr_replace_buttons_pc("*" + ch);
      draw_text_transformed(round(xx), yy, keyLabel, icon_scale, icon_scale, second);
      xx += measure_text_width_bitmap(keyLabel, icon_scale, font);
      str = str.substring(3);
    } else {
      // Invalid format fallback
      break;
    }
  }

  if (str.length > 0) {
    draw_text_transformed(round(xx), yy, str, icon_scale, icon_scale, second);
  }
}

function scr_drawtext_centered(xx, yy, text, second) {
  scr_drawtext_centered_scaled(xx, yy, text, 1, 1, second);
}


// scr_setfont
function scr_setfont(newfont, second = 0) {
  if (global.language === "ja") {
    /* this will never happen rn */ if (newfont === fnt_main)
      newfont = fnt_main;
    if (newfont === fnt_maintext) newfont = fnt_maintext;
    if (newfont === fnt_plain) newfont = fnt_plain;
  }
  draw_set_font(newfont, second);
}

function scr_getmusicindex(sound) {
  const song_index = sound;
  const priority = 80;
  return song_index;
}

function caster_load(sound) {
  return scr_getmusicindex(sound);
}

function caster_play(sound, volume = 1, pitch = 1) {
  const this_song_i = audio_play_sound(sound, 100, false);
  audio_sound_pitch(sound, pitch);
  audio_sound_gain(sound, volume, 0);
  return this_song_i;
}

function caster_stop(sound) {
  if (sound === -1) return;
  caster_free(sound);
}

function caster_free(sound) {
  if (sound === -1) return;
  if (sound !== "all") {
    audio_stop_sound(sound);
  } else {
    audio_stop_all();
  }
}

function caster_set_volume(sound, vol) {
  if (sound === -1) return;
  audio_sound_gain(sound, vol, 0);
}

function caster_get_volume(sound) {
  return sound.volume();
}

function caster_set_pitch(sound, pitch) {
  audio_sound_pitch(sound, pitch);
}

function caster_get_pitch(sound) {
  return sound.rate;
}

function caster_loop(song, gain, pitch) {
  let this_song_i = audio_play_sound(song, 120, true);
  audio_sound_pitch(song, pitch);
  audio_sound_gain(song, gain, 0);
  return this_song_i;
}

function SCR_TEXTSETUP(myfont, mycolor, writingx, writingy, writingxend, shake, textspeed, txtsound, spacing, vspacing) {
  this.myfont = myfont;
  this.mycolor = mycolor;
  this.writingx = writingx;
  this.writingy = writingy;
  this.writingxend = writingxend;
  this.writingxend_base = writingxend;
  this.shake = shake;
  this.textspeed = textspeed;
  this.txtsound = txtsound;
  this.spacing = spacing;
  this.vspacing = vspacing;
  this.vtext = 0;
  this.htextscale = 1;
  this.vtextscale = 1;
}

function SCR_TEXTTYPE(typer, x, y) {
  if (typer !== 0) {
    global.typer = typer;
  }

  switch (global.typer) {
    case 0:
      console.error("whys global.typer 0 wtf");
      break;

    case 1:
      SCR_TEXTSETUP.call(this,
        fnt_main,
        c_white,
        x + 20,
        y + 20,
        x + (global.idealborder[1] - 55),
        1,
        1,
        SND_TXT2,
        16,
        32
      );
      break;

    case 2:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 190,
        43,
        2,
        SND_TXT1,
        9,
        20
      );
      break;

    case 3:
      SCR_TEXTSETUP.call(this,
        fnt_curs,
        c_teal,
        x,
        y,
        x + 100,
        39,
        3,
        SND_TXT1,
        10,
        10
      );
      break;

    case 4:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 30,
        y + 15,
        view_xview[view_current] + 290,
        0,
        1,
        snd_txttor,
        8,
        18
      );
      break;

    case 5:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 30,
        y + 15,
        view_xview[view_current] + 290,
        0,
        1,
        SND_TXT1,
        8,
        18
      );
      break;

    case 6:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        0,
        1,
        snd_floweytalk1,
        9,
        20
      );
      break;

    case 7:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        2,
        2,
        snd_floweytalk2,
        9,
        20
      );
      break;

    case 8:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        0,
        1,
        snd_txttor,
        9,
        20
      );
      break;

    case 9:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        0,
        1,
        snd_floweytalk1,
        8,
        18
      );
      break;

    case 10:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        0,
        1,
        snd_nosound,
        8,
        18
      );
      break;

    case 11:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        0,
        3,
        SND_TXT2,
        9,
        18
      );
      break;
    
    case 12:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        1,
        3,
        snd_txttor2,
        10,
        20,
      );
      break;
    case 13:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        2,
        4,
        snd_txttor2,
        11,
        20,
      );
      break;
    case 14:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        3,
        5,
        snd_txttor2,
        14,
        20
      );
      break;
    case 15:
      SCR_TEXTSETUP.call(this,
        fnt_plain,
        c_black,
        x,
        y,
        x + 200,
        0,
        10,
        snd_txttor2,
        18,
        20,
      )
      break;
    case 16:
      SCR_TEXTSETUP.call(this,
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        1.2,
        2,
        snd_floweytalk2,
        8,
        18,
      )
      break;
    case 17:
      SCR_TEXTSETUP.call(this,
        fnt_comicsans,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        0,
        1,
        snd_txtsans,
        8,
        18,
      )
      break;
    case 19:
      global.typer = 18;
    case 18:
      SCR_TEXTSETUP.call(this,
        fnt_papyrus,
        c_white,
        x + 20,
        y + 20,
        view_xview[view_current] + 290,
        0,
        1,
        snd_txtpap,
        11,
        18,
      )
      break;
    case 20:
      SCR_TEXTSETUP.call(this,
        fnt_plainbig,
        c_black,
        x,
        y,
        x + 200,
        0,
        2,
        snd_floweytalk2,
        25,
        20,
      )
      break;
  }

  if (global.typer === 11 || global.typer === 112) {
    this.textspeed += 1;
  }
}

function snd_play(snd) {
  audio_play_sound(snd, 80, false);
}

function snd_stop(snd) {
  audio_stop_sound(snd);
}

function SCR_NEWLINE() {
  if (this.vtext)
  {
    this.myx -= this.vspacing;
    this.myy = this.writingy;
  }
  else
  {
    this.myx = this.writingx;
    this.myy += this.vspacing;
  }
}

function scr_hardmodename(string) {
  return string.toLowerCase() === "frisk";
}

function scr_namingscreen_setup(truereset) {
  const ascii_rows = 8;
  const ascii_cols = 7;

  const ascii_x = new Array(ascii_cols).fill(0).map((_, i) => 60 + (i * 32));
  const ascii_y = new Array(ascii_rows).fill(0);
  const ascii_charmap = Array.from({ length: ascii_rows }, () => new Array(ascii_cols).fill(""));

  for (let i = 0; i < ascii_rows / 2; i++) {
    ascii_y[i] = 75 + (i * 14);
    ascii_y[i + ascii_rows / 2] = 135 + (i * 14);

    for (let j = 0; j < ascii_cols; j++) {
      const index = (i * ascii_cols) + j;
      if (index < 26) {
        ascii_charmap[i][j] = String.fromCharCode(65 + index); // A-Z
        ascii_charmap[i + ascii_rows / 2][j] = String.fromCharCode(97 + index); // a-z
      }
    }
  }

  const selected_charmap = 0;
  const selected_row = 0;
  const selected_col = 0;
  const selected3 = 0;

  const title_y = 30;
  const name_y = 55;
  const charset_y = 999;
  const menu_y = 200;
  const name_x = 140;
  const menu_x0 = 60;
  const menu_x1 = 120;
  const menu_x2 = 220;
  const continue_x = 85;
  const reset_x = truereset !== 0 ? 175 : 195;

  return {
    ascii_rows,
    ascii_cols,
    ascii_x,
    ascii_y,
    ascii_charmap,

    selected_charmap,
    selected_row,
    selected_col,
    selected3,

    title_y,
    name_y,
    charset_y,
    menu_y,
    name_x,
    menu_x0,
    menu_x1,
    menu_x2,
    continue_x,
    reset_x
  };
}

function scr_namingscreen_check(charname) {
  const demonx = "...";
  const l_char = charname.toLowerCase();
  let allow = 1;
  let spec_m = "Is this name correct?";
  
  switch (l_char) {
    case "aaaaaa":
      allow = 1
      spec_m = "Not very creative...?"
      break;

    case "asgore":
      allow = 0;
      spec_m = "You cannot."
      break;
    
    case "toriel":
      allow = 0,
      spec_m = "I think you should#think of your own#name, my child."
      break;

    case "sans":
      allow = 0;
      spec_m = "nope."
      break;

    case "undyne":
      allow = 0;
      spec_m = "Get your OWN name!";
      break;
    
    case "flowey":
      allow = 0;
      spec_m = "I already CHOSE#that name.";
      break;

    case "chara":
      allow = 1;
      spec_m = "The true name."
      break;

    case "alphys":
      allow = 0;
      spec_m = "D-don't do that."
      break;

    case "alphy":
      allow = 1;
      spec_m = "Uh... OK?";
      break;

    case "papyru":
      allow = 1;
      spec_m = "I'ILL ALLOW IT!!!!";
      break;

    case "napsta" || "blooky":
      allow = 1;
      spec_m = "...........#(They're powerless to#stop you)";
      break;

    case "murder" || "mercy":
      allow = 1;
      spec_m = "That's a little on-#the nose, isn't it...?"
      break;

    case "asriel":
      allow = 0;
      spec_m = "...";
      break;

    case "catty":
      allow = 1;
      spec_m = "Bratty! Bratty!#That's MY name!";
      break;

    case "bratty":
      allow = 1;
      spec_m = "Like, OK I guess.";
      break;

    case "mtt" || "metta" || "mett":
      allow = 1;
      spec_m = "OOOOH!!! ARE YOU#PROMOTING MY BRAND?";
      break;

    case "gerson":
      allow = 1;
      spec_m = "Wah ha ha! Why not?";
      break;

    case "shyren":
      allow = 1;
      spec_m = "...?";
      break;

    case "aaron":
      allow = 1;
      spec_m = "Is this name correct? ; )";
      break;

    case "temmie":
      allow = 1;
      spec_m = "hOI!";
      break;

    case "woshua":
      allow = 1;
      spec_m = "Clean name.";
      break;

    case "jerry":
      allow = 1;
      spec_m = "Jerry.";
      break;

    case "bpants":
      allow = 1;
      spec_m = "You are really scraping the#bottom of the barrel."
      break;

    case "gaster":
      room_goto("room_introstory");
      break;
  }

  return {
    allow,
    spec_m,
  }
}

function scr_namingscreen() {
  let r = 0.5;
  let q = this.q;
  let rows = 8;
  let cols = 7;
  let xmap = [60, 92, 124, 156, 188, 220, 252];
  let ymap = [75, 89, 103, 117, 135, 149, 163, 177];
  let s = "";
  let charmap = [
    ["A","B","C","D","E","F","G"],
    ["H","I","J","K","L","M","N"],
    ["O","P","Q","R","S","T","U"],
    ["V","W","X","Y","Z","",""],
    ["a","b","c","d","e","f","g"],
    ["h","i","j","k","l","m","n"],
    ["o","p","q","r","s","t","u"],
    ["v","w","x","y","z","",""]
  ];
  let bks_f = 0;
  draw_set_color(c_white);
  scr_setfont(fnt_maintext, 0);
  const cy = caster_load(mus_cymbal);

  if (this.naming === 4) {
    global.charname = this.charname;
    instance_create(0, 0, obj_whitefader);
    caster_free("all");
    this.alerm = 0;
    this.naming = 5;
    caster_play(cy, 0.8, 0.95);
  }

  if (this.naming === 5) {
    this.alerm += 1

    if (this.q < 120) {
      this.q += 1;
    }

    var xx = this.name_x - (q / 3);

    draw_text_transformed(xx + random(r * 2), (q / 2) + this.name_y + random(r * 2), this.charname, 1 + (q / 50), 1 + (q / 50), random_ranger((-r * q) / 60, (r * q) / 60));

    if (this.alerm > 179)
    {
      instance_create(0, 0, obj_persistentfader);
      
      if (this.truereset > 0)
      {
        // TODO: save file
      }
      
      caster_free(cy);
      global.flag[5] = floor(random(100)) + 1; // fun value
      
      if (scr_hardmodename(this.charname)) {
        global.flag[6] = 1;
      }
      
      room_goto("room_area1");
    }
  }

  if (this.naming == 2)
  {
      if (this.charname == "")
      {
        this.spec_m = "You must choose a name.";
        this.allow = 0;
      }
      else if (scr_hardmodename(this.charname))
      {
          this.spec_m = "WARNING: This name will#make your life hell.#Proceed anyway?";
          this.allow = 1;
      }
      else if (this.hasname == 1 && this.truereset == 0 && !scr_hardmodename(global.charname))
      {
        this.spec_m = "A name has already#been chosen.";
        this.allow = 1;
      }
      else if (this.charname.toLowerCase() === "shayy") {
        switch (this.shayy) {
          case 0:
            this.spec_m = "shayy it's late, go to bed"
            this.allow = 0;
            this.raiseShayy = 1;
            break;
          case 1:
            this.spec_m = "bed it's late, go to shayy";
            this.allow = 0;
            this.raiseShayy = 2;
            break;
          case 2:
            this.spec_m = "you really are determined, arent you";
            this.allow = 0;
            this.raiseShayy = 3;
            break;
          case 3:
            this.spec_m = `${this.charname}, don't you have anything better#to do?`
            this.allow = 0;
            this.raiseShayy = 4;
            break;
          case 4:
            this.spec_m = "ok you can go but only this once"
            this.allow = 1;
            this.raiseShayy = 5;
            break;
          case 5:
            this.spec_m = "YOU IDIOT WHY DID YOU PRESS NO??#youre not going back now";
            this.allow = 0;
            this.raiseShayy = 6;
            break;
          case 6:
            this.spec_m = "trying forever wont get you#anywhere"
            this.allow = 0;
            this.raiseShayy = 7;
            break;
          case 7:
            this.spec_m = "..."
            this.allow = 0;
            this.raiseShayy = 8;
            break;
          case 8:
            this.spec_m = "..."
            this.allow = 0;
            this.raiseShayy = 9;
            break;
          case 9:
            this.spec_m = "..."
            this.allow = 0;
            this.raiseShayy = 10;
            break;
          case 10:
            this.spec_m = "..."
            this.allow = 0;
            this.raiseShayy = 11;
            break;
          case 11:
            this.spec_m = "youre just annoying atp"
            this.allow = 0;
            this.raiseShayy = 12;
            break;
          case 12:
            this.spec_m = "stop it"
            this.allow = 0;
            this.raiseShayy = 12;
        }
      }
      else
      {
        scr_namingscreen_check(this.charname);
      }
      
      var confirm = control_check_pressed(0) && this.selected2 >= 0;
      
      if (confirm)
      {
        if (this.allow)
        {
            if (this.selected2 == 1 && this.charname.length > 0)
            this.naming = 4;
        }
          
        if (this.selected2 == 0)
        {
          if (this.hasname == 1 && this.truereset == 0)
            this.naming = 3;
          else
            this.naming = 1;

          if (this.raiseShayy > 0) this.shayy = this.raiseShayy
        }
          
        return;
      }
      
      draw_set_color(c_white);
      
      if (this.q < 120)
          this.q += 1;
      
      var xx = this.name_x - (q / 3);
      
      draw_text_transformed(xx + random(r * 2), (q / 2) + this.name_y + random(r * 2), this.charname, 1 + (q / 50), 1 + (q / 50), random_ranger((-r * q) / 60, (r * q) / 60));
      draw_text(90, 30, this.spec_m);
      draw_set_color(c_white);
      
      if (this.allow)
      {
          if (this.selected2 == 0)
              draw_set_color(c_yellow);
          
          scr_drawtext_centered(80, 200, "No"); // No
          draw_set_color(c_white);
          
          if (this.selected2 == 1)
              draw_set_color(c_yellow);
          
          scr_drawtext_centered(240, 200, "Yes"); // Yes
      }
      else
      {
          draw_set_color(c_yellow);
          scr_drawtext_centered(80, 200, "Go back"); // Go back
          draw_set_color(c_white);
      }
      
      if (this.allow)
      {
          if (keyboard_check_pressed(vk_right) || keyboard_check_pressed(vk_left))
          {
              if (this.selected2 === 1) {
                  this.selected2 = 0;
              } else if (this.selected2 === 0) {
                  this.selected2 = 1;
              }
          }
      }
  }
  if (this.naming == 1)
  {
      this.q = 0;
      r = 0.6;
      
      for (var row = 0; row < rows; row++)
      {
          var yy = ymap[row];
          
          for (var col = 0; col < cols; col++)
          {
              var xx = xmap[col];
              
              if (this.selected_row == row && this.selected_col == col)
                  draw_set_color(c_yellow);
              else
                  draw_set_color(c_white);
              
              draw_text(xx + random(r), yy + random(r), charmap[row][col]);
          }
      }
      
      draw_set_color(c_white);
      
      if (this.selected_row == -1 && this.selected_col == 0)
          draw_set_color(c_yellow);
      
      var menu_text0 = "Quit"; // Quit
      draw_text(this.menu_x0, this.menu_y, menu_text0);
      draw_set_color(c_white);
      
      if (this.selected_row == -1 && this.selected_col == 1)
          draw_set_color(c_yellow);
      
      var menu_text1 = "Backspace"; // Backspace
      draw_text(this.menu_x1, this.menu_y, menu_text1);
      draw_set_color(c_white);
      
      if (this.selected_row == -1 && this.selected_col == 2)
          draw_set_color(c_yellow);
      
      var menu_text2 = "Done"; // Done
      draw_text(this.menu_x2, this.menu_y, menu_text2);
      
      var old_col = this.selected_col;
      
      do
      {
          if (keyboard_check_pressed(vk_right))
          {
              this.selected_col++;
              
              if (this.selected_row == -1)
              {
                  if (this.selected_col > 2)
                      this.selected_col = 0;
              }
              else if (this.selected_col >= cols)
              {
                  if (this.selected_row == (rows - 1))
                  {
                      this.selected_col = old_col;
                      break;
                  }
                  else
                  {
                      this.selected_col = 0;
                      this.selected_row++;
                  }
              }
          }
          
          if (keyboard_check_pressed(vk_left))
          {
              this.selected_col--;
              
              if (this.selected_col < 0)
              {
                  if (this.selected_row == 0)
                  {
                      this.selected_col = 0;
                  }
                  else if (this.selected_row > 0)
                  {
                      this.selected_col = cols - 1;
                      this.selected_row--;
                  }
                  else
                  {
                      this.selected_col = 2;
                  }
              }
          }
          
          if (keyboard_check_pressed(vk_down))
          {
              if (this.selected_row == -1)
              {
                  this.selected_row = 0;
                  var xx = this.menu_x0;
                  
                  if (this.selected_col == 1)
                      xx = this.menu_x1;
                  
                  if (this.selected_col == 2)
                      xx = this.menu_x2;
                  
                  var best = 0;
                  var bestdiff = Math.abs(xmap[0] - xx);
                  
                  for (var i = 1; i < cols; i++)
                  {
                      var diff = Math.abs(xmap[i] - xx);
                      
                      if (diff < bestdiff)
                      {
                          best = i;
                          bestdiff = diff;
                      }
                  }
                  
                  this.selected_col = best;
              }
              else
              {
                  this.selected_row++;
                  
                  if (this.selected_row >= rows)
                  {
                      if (global.language == "ja")
                      {
                          this.selected_row = -2;
                          var xx = xmap[this.selected_col];
                          
                          if (xx >= (charset_x2 - 10))
                              this.selected_col = 2;
                          else if (xx >= (charset_x1 - 10))
                              this.selected_col = 1;
                          else
                              this.selected_col = 0;
                      }
                      else
                      {
                          this.selected_row = -1;
                          var xx = xmap[this.selected_col];
                          
                          if (xx >= (this.menu_x2 - 10))
                              this.selected_col = 2;
                          else if (xx >= (this.menu_x1 - 10))
                              this.selected_col = 1;
                          else
                              this.selected_col = 0;
                      }
                  }
              }
          }
          
          if (keyboard_check_pressed(vk_up))
          {
              if (this.selected_row == -2)
              {
                  this.selected_row = rows - 1;
                  
                  if (this.selected_col > 0)
                  {
                      var xx = charset_x1;
                      
                      if (this.selected_col == 2)
                          xx = charset_x2;
                      
                      var best = 0;
                      var bestdiff = Math.abs(xmap[0] - xx);
                      
                      for (var i = 1; i < cols; i++)
                      {
                          var diff = Math.abs(xmap[i] - xx);
                          
                          if (diff < bestdiff)
                          {
                              best = i;
                              bestdiff = diff;
                          }
                      }
                      
                      this.selected_col = best;
                  }
              }
              else if (global.language != "ja" && this.selected_row == -1)
              {
                  this.selected_row = rows - 1;
                  
                  if (this.selected_col > 0)
                  {
                      var xx = this.menu_x1;
                      
                      if (this.selected_col == 2)
                          xx = this.menu_x2;
                      
                      var best = 0;
                      var bestdiff = Math.abs(xmap[0] - xx);
                      
                      for (var i = 1; i < cols; i++)
                      {
                          var diff = Math.abs(xmap[i] - xx);
                          
                          if (diff < bestdiff)
                          {
                              best = i;
                              bestdiff = diff;
                          }
                      }
                      
                      this.selected_col = best;
                  }
              }
              else
              {
                  this.selected_row--;
                  
                  if (this.selected_row == -1)
                  {
                      var xx = xmap[this.selected_col];
                      
                      if (xx >= (this.menu_x2 - 10))
                          this.selected_col = 2;
                      else if (xx >= (this.menu_x1 - 10))
                          this.selected_col = 1;
                      else
                          this.selected_col = 0;
                  }
              }
          }
      }
      while (!(this.selected_col < 0 || this.selected_row < 0 || charmap[this.selected_row][this.selected_col].length > 0)) {};
      
      bks_f = 0;
      var confirm = control_check_pressed(0);
      
      if (confirm)
      {
          if (this.selected_row == -1)
          {
              if (this.selected_col == 0)
                  this.naming = 3;
              
              if (this.selected_col == 1)
                  bks_f = 1;
              
              if (this.selected_col == 2)
              {
                  if (this.charname.length > 0)
                  {
                      this.naming = 2;
                      this.selected2 = 0;
                  }
              }
              
              control_clear(0);
          }
          else if (this.selected_row == -2)
          {
              this.selected_charmap = 1 + this.selected_col;
              
              if (this.selected_charmap == 1)
              {
                  rows = hiragana_rows;
                  cols = hiragana_cols;
                  xmap = hiragana_x;
                  ymap = hiragana_y;
                  charmap = hiragana_charmap;
              }
              else if (this.selected_charmap == 2)
              {
                  rows = katakana_rows;
                  cols = katakana_cols;
                  xmap = katakana_x;
                  ymap = katakana_y;
                  charmap = katakana_charmap;
              }
              else
              {
                  rows = ja_ascii_rows;
                  cols = ja_ascii_cols;
                  xmap = ja_ascii_x;
                  ymap = ja_ascii_y;
                  charmap = ja_ascii_charmap;
              }
          }
          else
          {
              if (this.charname.length == 6)
                  this.charname = string_delete(this.charname, 6, 1);
              
              this.charname += charmap[this.selected_row][this.selected_col];
          }
      }
      
      if (control_check_pressed(1) || bks_f == 1)
      {
          s = this.charname.length;
          
          if (s > 0)
              this.charname = string_delete(this.charname, s, 1);
          
          control_clear(1);
      }
      
      draw_set_color(c_white);
      draw_text(this.name_x, this.name_y, this.charname);
      scr_drawtext_centered(160, this.title_y, "Name the fallen human.");
  }

  if (this.naming === 3)
  {
      if (this.hasname == 1)
      {
          this.minutes = floor(this.time / 1800);
          this.seconds = round(((this.time / 1800) - this.minutes) * 60);
          
          if (this.seconds == 60)
              this.seconds = 0;
          
          if (this.seconds < 10)
              this.seconds = "0" + string(this.seconds);
          
          var roomname = scr_roomname(this.roome);
          var lvtext = scr_gettext("save_menu_lv", string(this.love));
          var timetext = scr_gettext("save_menu_time", string(this.minutes), string(this.seconds));
          var namesize = string_length(substr(this.name, 1, 6));
          var lvsize = lvtext.length;
          var timesize = timetext.length;
          var x_center = 160;
          var lvpos = round((x_center + (namesize / 2)) - (timesize / 2) - (lvsize / 2));
          var namepos = 70;
          var timepos = 250;
          
          if (global.language == "ja")
          {
              namepos -= 6;
              timepos += 6;
          }
          
          draw_text(namepos, 62, this.name);
          draw_text(lvpos, 62, lvtext);
          draw_text(timepos - timesize, 62, timetext);
          
          if (global.language == "ja")
              scr_drawtext_centered(x_center, 80, roomname);
          else
              draw_text(namepos, 80, roomname);
          
          if (this.namingscreen_setup.selected3 == 0)
              draw_set_color(c_yellow);
          
          var continue_text = "Continue"; // Continue
          draw_text(this.continue_x, 105, continue_text);
          draw_set_color(c_white);
          draw_set_color(c_white);
          
          if (this.namingscreen_setup.selected3 == 2)
              draw_set_color(c_yellow);
          
          scr_drawtext_centered(160, 125, "Settings"); // Settings
          draw_set_color(c_white);
          
          if (this.namingscreen_setup.selected3 == 1)
              draw_set_color(c_yellow);
          
          var reset_text;
          
          if (this.truereset == 0)
              reset_text = "Reset"; // Reset
          else
              reset_text = "True Reset"; // True Reset
          
          draw_text(this.reset_x, 105, reset_text);
          
          if (keyboard_check_pressed(vk_right) || keyboard_check_pressed(vk_left))
          {
              if (this.namingscreen_setup.selected3 == 0)
                  this.namingscreen_setup.selected3 = 1;
              else if (this.namingscreen_setup.selected3 == 1)
                  this.namingscreen_setup.selected3 = 0;
          }
          
          if (keyboard_check_pressed(vk_down))
          {
              if (this.namingscreen_setup.selected3 == 0 || this.namingscreen_setup.selected3 == 1)
                  this.namingscreen_setup.selected3 = 2;
          }
          
          if (keyboard_check_pressed(vk_up))
          {
              if (this.namingscreen_setup.selected3 == 2)
                  this.namingscreen_setup.selected3 = 0;
          }
          
          var action = -1;
          
          if (control_check_pressed(0))
              action = this.namingscreen_setup.selected3;
          
          if (action == 0)
          {
              caster_free("all");
              
              if (file_exists("file0") === 0)
                  room_goto("room_area1");
              else
                  script_execute.call(this, scr_load);
          }
          
          if (action == 1)
          {
              if (this.hasname == 0 || scr_hardmodename(global.charname) || this.truereset > 0)
              {
                  this.naming = 1;
              }
              else
              {
                  this.charname = global.charname;
                  this.naming = 2;
                  this.alerm = 0;
                  r = 0.5;
                  q = 0;
              }
              
              control_clear(0);
          }
          
          if (action == 2)
          {
              caster_free("all");
              room_goto("room_settings");
          }
      }
      else
      {
          draw_set_color(c_ltgray);
          draw_text(85, 20, "--- Instruction ---"); //  --- Instruction ---
          draw_text(85, 50, "[Z or ENTER] - Confirm"); // Confirm
          draw_text(85, 70, "[X or SHIFT] - Cancel"); // Cancel
          draw_text(85, 90, "[C or CTRL] - Menu (In-game)"); // Menu (In-game)
          draw_text(85, 110, "[F4] - Fullscreen");
          draw_text(85, 130, "[Hold ESC] - Quit");
          draw_text(86, 150, "When HP is 0, you lose."); // When HP is 0, you lose.
          
          
          var xx = 85;
          
          var yy = 180;
          
          draw_set_color(c_white);
          
          if (this.selected3 == 0)
              draw_set_color(c_yellow);
          
          draw_text(xx, yy, "Begin Game"); // Begin Game
          
          if (keyboard_check_pressed(vk_down))
          {
              if (this.selected3 == 0)
                  this.selected3 = 1;
          }
          
          if (keyboard_check_pressed(vk_up))
          {
              if (this.selected3 == 1)
                  this.selected3 = 0;
          }
          
          var yy2 = yy + 20;
          draw_set_color(c_white);
          
          if (this.selected3 == 1)
              draw_set_color(c_yellow);
          
          draw_text(xx, yy2, "Settings"); // Settings
          var action = -1;
          
          if (control_check_pressed(0))
              action = this.selected3;
          
          if (action == 0)
          {
              this.naming = 1;
              control_clear(1);
          }
          
          if (action == 1)
          {
              caster_free("all");
              room_goto("room_settings");
          }
      }
  }
}

function random_ranger(arg0, arg1) {
  return random(Math.abs(arg1 - arg0) + Math.min(arg1, arg0));
}

function ossafe_fill_rectangle(x1, y1, x2, y2) {
  if (x1 > x2)
  {
      var temp = x1;
      x1 = x2;
      x2 = temp;
  }

  if (y1 > y2)
  {
      var temp = y1;
      y1 = y2;
      y2 = temp;
  }

  draw_rectangle(x1, y1, x2, y2, false);
}

function scr_npcdir(argument0) {
  if (this.myinteract == 0)
  {
      if (this.direction >= 225 && this.direction < 315)
      {
          this.facing = 0;
          this.sprite_index = this.dsprite;
      }
      
      if (this.direction >= 315 || this.direction < 45)
      {
          this.facing = 1;
          this.sprite_index = this.rsprite;
      }
      
      if (this.direction >= 45 && this.direction < 135)
      {
          this.facing = 2;
          this.sprite_index = this.usprite;
      }
      
      if (this.direction >= 135 && this.direction < 225)
      {
          this.facing = 3;
          this.sprite_index = this.lsprite;
      }
  }

  if (this.myinteract == (1 + argument0))
  {
      if (this.facing == 0)
          this.sprite_index = this.dtsprite;
      
      if (this.facing == 1)
          this.sprite_index = this.rtsprite;
      
      if (this.facing == 2)
          this.sprite_index = this.utsprite;
      
      if (this.facing == 3)
          this.sprite_index = this.ltsprite;
  }
}

function scr_npcdirspeed() {
  if (this.myinteract == 0)
  {
      if (this.vspeed > 0 && this.vspeed > abs(this.hspeed))
      {
          this.facing = 0;
          this.sprite_index = this.dsprite;
      }
      
      if (this.hspeed > 0 && this.hspeed > abs(this.vspeed))
      {
          this.facing = 1;
          this.sprite_index = this.rsprite;
      }
      
      if (this.vspeed < 0 && abs(this.vspeed) > abs(this.hspeed))
      {
          this.facing = 2;
          this.sprite_index = this.usprite;
      }
      
      if (this.hspeed < 0 && abs(this.hspeed) > abs(this.vspeed))
      {
          this.facing = 3;
          this.sprite_index = this.lsprite;
      }
  }

  if (this.myinteract == 1)
  {
      if (this.facing == 0)
          this.sprite_index = this.dtsprite;
      
      if (this.facing == 1)
          this.sprite_index = this.rtsprite;
      
      if (this.facing == 2)
          this.sprite_index = this.utsprite;
      
      if (this.facing == 3)
          this.sprite_index = this.ltsprite;
  }
}

function scr_interact() {
  this.myinteract = 1;
}

function scr_facechoice() {
  if (!this.writer) return;
  switch (global.facechoice) {
    case 1:
      instance_create(this.writer.x - 33, this.writer.y + 25, obj_face_torieltalk);
      instance_create(0, 0, obj_torbody);
      break;
    case 2:
      instance_create(this.writer.x - 36, this.writer.y + 25, obj_face_floweytalk);
      break;
    case 3:
      instance_create(this.writer.x - 35, this.writer.y + 25, obj_face_sans);
      break;
    case 4:
      instance_create(this.writer.x - 35, this.writer.y + 25, obj_face_papyrus);
      break;
    case 5:
      instance_create(this.writer.x - 40, this.writer.y + 25, obj_face_undyne);
      break;
    case 6:
      instance_create(this.writer.x - 39, this.writer.y + 25, obj_face_alphys);
      break;
    case 7:
      instance_create(this.writer.x - 40, this.writer.y + 20, obj_face_asgore);
      break;
    case 8:
      instance_create(this.writer.x - 18, this.writer.y + 45, obj_face_mettaton);
      break;
    case 9:
      instance_create(this.writer.x - 30, this.writer.y + 30, obj_face_asriel);
      break;
  }
}

function scr_gettext(text_id, one, two, three, four, five, six, seven, eight, nine) {
  let text = ds_map_find_value(global.text_data_en, text_id);

  if (text === undefined) {
    text = "";
  }

  for (var i = 1; i <= (string_length(text) - 3); i++) {
    if (string_copy(text, i, 2) === "\\[" && string_char_at(text, i + 2) === "]") {
      let sel = string_char_at(text, i + 1);
      let replace = "";

      switch (sel) {
        case "C":
          replace = global.charname;
          break;
        case "G":
          replace = String(global.gold);
          break;
        case "I":
          replace = global.itemname[global.menucoord[1]];
          break;
        case "1":
          replace = one;
          break;
        case "2":
          replace = two;
          break;
        case "3":
          replace = three;
          break;
        case "4":
          replace = four;
          break;
        case "5":
          replace = five;
          break;
        case "6":
          replace = six;
          break;
        case "7":
          replace = seven;
          break;
        case "8":
          replace = eight;
          break;
        case "9":
          replace = nine;
          break;
      }
      let before =  string_copy(text, 1, i - 1);
      let after = string_copy(text, i + 4, string_length(text))
      text = before + replace + after;
      i += (string_length(replace) - 1);
    }
  }

  return text;
}

function scr_roomname(argument0) {
  if (argument0 === 0) {
    return scr_gettext("roomname_0"); // --
  }

  let roomid = room_get_name(argument0);

  if (substr(roomid, 1, 5) === "room_") {
    let roomname = scr_gettext("roomname" + substr(roomid, 6));
    if (roomname !== "") {
      return roomname;
    }
  }
  return " ";
}

function substr(str, pos, len) {
  if (pos < 0) {
    pos = strlen(str) + 1 + pos;
  }
  if (!len) {
    len = (strlen(str) - pos) + 1
  }

  if (len > 0) {
    return string_copy(str, len, pos);
  } else {
    return "";
  }
}

function strlen(str) {
  return string_length(str);
}

function SCR_BORDERSETUP() {
  if (global.border == 0)
  {
    global.idealborder[0] = 32;
    global.idealborder[1] = 602;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 1)
  {
    global.idealborder[0] = 217;
    global.idealborder[1] = 417;
    global.idealborder[2] = 180;
    global.idealborder[3] = 385;
  }

  if (global.border == 2)
  {
    global.idealborder[0] = 217;
    global.idealborder[1] = 417;
    global.idealborder[2] = 125;
    global.idealborder[3] = 385;
  }

  if (global.border == 3)
  {
    global.idealborder[0] = 237;
    global.idealborder[1] = 397;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 4)
  {
    global.idealborder[0] = 267;
    global.idealborder[1] = 367;
    global.idealborder[2] = 295;
    global.idealborder[3] = 385;
  }

  if (global.border == 5)
  {
    global.idealborder[0] = 192;
    global.idealborder[1] = 442;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 6)
  {
    global.idealborder[0] = 227;
    global.idealborder[1] = 407;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 7)
  {
    global.idealborder[0] = 227;
    global.idealborder[1] = 407;
    global.idealborder[2] = 200;
    global.idealborder[3] = 385;
  }

  if (global.border == 8)
  {
    global.idealborder[0] = 202;
    global.idealborder[1] = 432;
    global.idealborder[2] = 290;
    global.idealborder[3] = 385;
  }

  if (global.border == 9)
  {
    global.idealborder[0] = 132;
    global.idealborder[1] = 492;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 10)
  {
    global.idealborder[0] = 147;
    global.idealborder[1] = 487;
    global.idealborder[2] = 200;
    global.idealborder[3] = 385;
  }

  if (global.border == 11)
  {
    global.idealborder[0] = 32;
    global.idealborder[1] = 602;
    global.idealborder[2] = 330;
    global.idealborder[3] = 465;
  }

  if (global.border == 12)
  {
    global.idealborder[0] = (room_width / 2) - 40;
    global.idealborder[1] = (room_width / 2) + 40;
    global.idealborder[2] = (room_height / 2) - 40;
    global.idealborder[3] = (room_height / 2) + 40;
  }

  if (global.border == 13)
  {
    global.idealborder[0] = (room_width / 2) - 40;
    global.idealborder[1] = (room_width / 2) + 40;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 14)
  {
    global.idealborder[0] = (room_width / 2) - 35;
    global.idealborder[1] = (room_width / 2) + 35;
    global.idealborder[2] = 300;
    global.idealborder[3] = 385;
  }

  if (global.border == 15)
  {
    global.idealborder[0] = (room_width / 2) - 50;
    global.idealborder[1] = (room_width / 2) + 50;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 16)
  {
    global.idealborder[0] = (room_width / 2) - 50;
    global.idealborder[1] = (room_width / 2) + 50;
    global.idealborder[2] = 50;
    global.idealborder[3] = 385;
  }

  if (global.border == 17)
  {
    global.idealborder[0] = 162;
    global.idealborder[1] = 472;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 18)
  {
    global.idealborder[0] = 162;
    global.idealborder[1] = 472;
    global.idealborder[2] = 220;
    global.idealborder[3] = 385;
  }

  if (global.border == 19)
  {
    global.idealborder[0] = (roomSize.width / 2) - 100;
    global.idealborder[1] = (roomSize.width / 2) + 100;
    global.idealborder[2] = 185;
    global.idealborder[3] = 385;
  }

  if (global.border == 20)
  {
    global.idealborder[0] = 257;
    global.idealborder[1] = 547;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 21)
  {
    global.idealborder[0] = 197;
    global.idealborder[1] = 437;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 22)
  {
    offpurple = 0;
    
    if (instance_exists(obj_purpleheart))
    {
        offpurple = obj_purpleheart.yzero;
        
        if (offpurple > 250)
            offpurple = 250;
    }
    
    global.idealborder[0] = 197;
    global.idealborder[1] = 437;
    global.idealborder[2] = 250;
    
    if (offpurple != 0)
        global.idealborder[2] = offpurple - 10;
    
    global.idealborder[3] = 385;
  }

  if (global.border == 23)
  {
    offpurple = 0;
    
    if (instance_exists(obj_purpleheart))
    {
        offpurple = obj_purpleheart.yzero;
        
        if (offpurple > 250)
            offpurple = 250;
    }
    
    global.idealborder[0] = 197;
    global.idealborder[1] = 537;
    global.idealborder[2] = 250;
    
    if (offpurple != 0)
        global.idealborder[2] = offpurple - 10;
    
    global.idealborder[3] = 385;
  }

  if (global.border == 24)
  {
    global.idealborder[0] = 235;
    global.idealborder[1] = 405;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 25)
  {
    global.idealborder[0] = 235;
    global.idealborder[1] = 405;
    global.idealborder[2] = 160;
    global.idealborder[3] = 385;
  }

  if (global.border == 26)
  {
    global.idealborder[0] = 295;
    global.idealborder[1] = 345;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 27)
  {
    global.idealborder[0] = 270;
    global.idealborder[1] = 370;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 28)
  {
    global.idealborder[0] = 235;
    global.idealborder[1] = 405;
    global.idealborder[2] = 35;
    global.idealborder[3] = 385;
  }

  if (global.border == 29)
  {
    global.idealborder[0] = 207;
    global.idealborder[1] = 427;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 30)
  {
    global.idealborder[0] = 207;
    global.idealborder[1] = 427;
    global.idealborder[2] = 200;
    global.idealborder[3] = 385;
  }

  if (global.border == 31)
  {
    global.idealborder[0] = 32;
    global.idealborder[1] = 602;
    global.idealborder[2] = 100;
    global.idealborder[3] = 385;
  }

  if (global.border == 35)
  {
    global.idealborder[0] = 132;
    global.idealborder[1] = 502;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 36)
  {
    global.idealborder[0] = 240;
    global.idealborder[1] = 400;
    global.idealborder[2] = 225;
    global.idealborder[3] = 385;
  }

  if (global.border == 37)
  {
    global.idealborder[3] = 385;
    global.idealborder[2] = global.idealborder[3] - 200;
    global.idealborder[0] = 120;
    global.idealborder[1] = 520;
  }

  if (global.border == 38)
  {
    global.idealborder[0] = 270;
    global.idealborder[1] = 370;
    global.idealborder[2] = 285;
    global.idealborder[3] = 385;
  }

  if (global.border == 39)
  {
    global.idealborder[0] = 132;
    global.idealborder[1] = 502;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
    global.idealborder[0] -= 20;
    global.idealborder[1] += 40;
    global.idealborder[2] -= 20;
  }

  if (global.border == 50)
  {
    global.idealborder[0] = 192;
    global.idealborder[1] = 512;
    global.idealborder[2] = 250;
    global.idealborder[3] = 385;
  }

  if (global.border == 51)
  {
    global.idealborder[0] = 192;
    global.idealborder[1] = 512;
    global.idealborder[2] = 250;
    
    if (obj_heart.y < 270)
        global.idealborder[2] = round((obj_heart.y - 20) / 5) * 5;
    
    global.idealborder[3] = 385;
  }

  if (global.border == 52)
  {
    global.idealborder[0] = 250;
    global.idealborder[1] = 390;
    global.idealborder[2] = 250;
    global.idealborder[3] = 320;
  }
}

function scr_textskip() {
  if (instance_exists(OBJ_WRITER))
  {
    if (control_check_pressed(1))
    {
      _with (OBJ_WRITER, function() {
        this.stringpos = string_length(this.originalstring);
      })
      
      control_clear(1);
    }
  }
}

function caster_resume(sound) {
  audio_resume_sound(sound);
}

function caster_pause(sound) {
  audio_pause_sound(sound);
}

function scr_gameoverb() {
  global.hp = 0;

  if (global.battlegroup === 22) {
    _with("obj_torielboss", function() {
      this.sprite_index = "spr_torielboss_mouthcover";
    })
  }

  if (instance_exists("obj_asgoreb")) {
    ini_open("undertale.ini");
    const ky = ini_read_real("Asgore", "KillYou", 0);
    ini_write_real("Asgore", "KillYou", ky + 1);
    ini_close();
  }

  if (instance_exists("obj_spiderb")) {
    global.tempvalue[11] += 1;
  }

  ini_open("undertale.ini");
  const g_o = ini_read_real("General", "Gameover", 0);
  ini_close();
  audio_stop_all();
  caster_stop("all");
  caster_free("all");

  if (instance_exists("obj_heart")) {
    _with(obj_heart, function() {
      global.myxb = this.x;
      global.myyb = this.y;
    })
  }

  if (instance_exists(obj_fakeheart)) {
    _with(obj_fakeheart, function() {
      global.myxb = this.x;
      global.myyb = this.y;
    })
  }

  room_goto("room_gameover")
}

function snd_isplaying(snd) {
  return audio_is_playing(snd)
}

function scr_depth() {
  this.depth = 50000 - ((this.y * 10) + (this.sprite_height * 10));
}

function caster_is_playing(argument0) {
  if (audio_is_playing(argument0))
    return 1;
  else
    return 0;
}

function scr_murderlv() {
  let mrd = 0;

  if (global.flag[202] >= 20)
    mrd = 1;

  if (mrd == 1 && global.flag[45] == 4)
    mrd = 2;

  if (mrd == 2 && global.flag[52] == 1)
    mrd = 3;

  if (mrd == 3 && global.flag[53] == 1)
    mrd = 4;

  if (mrd == 4 && global.flag[54] == 1)
    mrd = 5;

  if (mrd == 5 && global.flag[57] == 2)
    mrd = 6;

  if (mrd == 6 && global.flag[203] >= 16)
    mrd = 7;

  if (mrd == 7 && global.flag[67] == 1)
    mrd = 8;

  if (mrd == 8 && global.flag[81] == 1)
    mrd = 9;

  if (mrd == 9 && global.flag[252] == 1)
    mrd = 10;

  if (mrd == 10 && global.flag[204] >= 18)
    mrd = 11;

  if (mrd == 11 && global.flag[251] == 1 && global.flag[350] == 1)
    mrd = 12;

  if (mrd == 12 && global.flag[402] == 1)
    mrd = 13;

  if (mrd == 13 && global.flag[397] == 1)
    mrd = 14;

  if (mrd == 14 && global.flag[205] >= 40)
    mrd = 15;

  if (mrd == 15 && global.flag[425] == 1 && global.flag[27] == 0)
    mrd = 16;

  let murderboy = mrd;

  if (global.flag[26] > 0) {
    mrd = global.flag[26];
  }

  return mrd;
}

export {
  scr_replace_buttons_pc,
  scr_drawtext_icons,
  scr_drawtext_icons_multiline,
  scr_drawtext_centered,
  scr_drawtext_centered_scaled,
  scr_setfont,
  caster_load,
  caster_play,
  caster_stop,
  caster_free,
  caster_set_volume,
  caster_get_volume,
  caster_set_pitch,
  caster_get_pitch,
  caster_loop,
  snd_play,
  snd_stop,
  snd_isplaying,
  SCR_TEXTSETUP,
  SCR_TEXTTYPE,
  SCR_NEWLINE,
  scr_namingscreen_setup,
  scr_namingscreen_check,
  scr_namingscreen,
  scr_hardmodename,
  random_ranger,
  ossafe_fill_rectangle,
  scr_npcdir,
  scr_npcdirspeed,
  scr_interact,
  scr_facechoice,
  scr_gettext,
  scr_roomname,
  substr,
  strlen,
  SCR_BORDERSETUP,
  scr_textskip,
  caster_resume,
  caster_pause,
  caster_is_playing,
  scr_gameoverb,
  scr_depth,
  scr_murderlv,
};
