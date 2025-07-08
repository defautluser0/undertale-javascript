import {
  audio_play_sound,
  audio_sound_gain,
  audio_sound_pitch,
  audio_stop_all,
  audio_stop_sound,
  round,
  currentFont,
  surface_get_width,
  random,
  keyboard_check_pressed,
  string_delete,
  instance_create,
} from "/imports/assets/gamemakerFunctions.js";
import {
  draw_text,
  draw_text_transformed,
  draw_set_font,
  draw_set_color,
  fnt_main,
  fnt_maintext,
  fnt_plain,
  c_white,
  c_black,
  SND_TXT1,
  SND_TXT2,
  snd_txttor,
  snd_floweytalk1,
  snd_floweytalk2,
  snd_nosound,
  room_goto,
  c_ltgray,
  c_yellow,
  mus_cymbal,
} from "/imports/assets.js";
import { vk_down, vk_up, vk_right, vk_left, control_check_pressed, control_clear } from "/imports/input.js"
import global from "/imports/assets/global.js";
import { view_current, view_wview } from "/imports/view.js"
import * as obj_whitefader from "/obj/whitefader/index.js";
import * as obj_persistentfader from "/obj/persistentfader/index.js";

function scr_replace_buttons_pc(str) {
  return str
    .replaceAll("*Z", "[Z]")
    .replaceAll("*X", "[X]")
    .replaceAll("*C", "[C]")
    .replaceAll("*A", "[LEFT]")
    .replaceAll("*D", "[RIGHT]");
}

function measure_text_width_bitmap(text, xscale = 1) {
  let width = 0;
  for (const char of text) {
    const glyph = currentFont.glyphs[char];
    if (glyph) {
      // glyph.shift is the advance, fallback to glyph.w + glyph.offset if missing
      const advance = glyph.shift ?? (glyph.w + (glyph.offset || 0));
      width += advance * xscale;
    } else {
      width += currentFont.size * xscale; // fallback width
    }
  }
  return width;
}

function scr_drawtext_centered_scaled(xx, yy, text, xscale, yscale, second = 0) {
  const fontSize = currentFont.size;
  const display_scale = surface_get_width("application_surface") / view_wview[view_current];
  const lineheight = Math.round(fontSize * yscale);

  // Fix vertical position rounding similar to GML
  yy = Math.round(yy * display_scale) / display_scale;

  let lines = text.split("#");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const width = measure_text_width_bitmap(line, xscale);
    const line_x = Math.round((xx - width / 2) * display_scale) / display_scale;

    draw_text_transformed(line_x, yy, line, xscale, yscale, 0, second);

    yy += lineheight;
  }
}

function scr_drawtext_icons_multiline(x0, y0, str, icon_scale = 1) {
  str = scr_replace_buttons_pc(str);
  const lineHeight = (currentFont.glyphs[" "].h);
  let xx = x0;
  let yy = y0;
  let outstr = "";

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
        xx += round(measure_text_width_bitmap(outstr, icon_scale));
        outstr = "";
      }
      i += 2;
      const ch = str[i];
      const keyLabel = scr_replace_buttons_pc("*" + ch);
      draw_text_transformed(xx, yy, keyLabel, icon_scale, icon_scale, 0);
      xx += measure_text_width_bitmap(keyLabel, icon_scale);
    } else {
      outstr += str[i];
    }
  }
  if (outstr.length > 0) {
    draw_text(xx, yy, outstr);
  }
}

function scr_drawtext_icons(xx, yy, str, icon_scale = 1) {
  str = scr_replace_buttons_pc(str);

  while (true) {
    let i = str.indexOf("*");
    if (i === -1) break;

    if (i > 0) {
      const s = str.substring(0, i);
      draw_text_transformed(xx, yy, s, icon_scale, icon_scale, 0);
      xx += measure_text_width_bitmap(s, icon_scale);
      str = str.substring(i);
    }

    if (str.length >= 3 && str[0] === "*" && str[2]) {
      const ch = str[2];
      const keyLabel = scr_replace_buttons_pc("*" + ch);
      draw_text_transformed(xx, yy, keyLabel, icon_scale, icon_scale, 0);
      xx += measure_text_width_bitmap(keyLabel, icon_scale);
      str = str.substring(3);
    } else {
      // Invalid format fallback
      break;
    }
  }

  if (str.length > 0) {
    draw_text_transformed(xx, yy, str, icon_scale, icon_scale, 0);
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

function caster_play(sound, volume, pitch) {
  const this_song_i = audio_play_sound(sound, 100, false);
  audio_sound_pitch(sound, pitch);
  audio_sound_gain(sound, volume, 0);
  return this_song_i;
}

function caster_stop(sound) {
  caster_free(sound);
}

function caster_free(sound) {
  if (sound !== "all") {
    audio_stop_sound(sound);
  } else {
    audio_stop_all();
  }
}

function caster_set_volume(sound, vol) {
  audio_sound_gain(sound, vol, 0);
}

function caster_loop(song, gain, pitch) {
  let this_song_i = audio_play_sound(song, 120, true);
  audio_sound_pitch(song, pitch);
  audio_sound_gain(song, gain);
  return this_song_i;
}

function SCR_TEXTSETUP(
  myfont,
  mycolor,
  writingx,
  writingy,
  writingxend,
  shake,
  textspeed,
  txtsound,
  spacing,
  vspacing
) {
  return {
    myfont,
    mycolor,
    writingx,
    writingy,
    writingxend,
    writingxend_base: writingxend,
    shake,
    textspeed,
    txtsound,
    spacing,
    vspacing,
    vtext: 0,
    htextscale: 1,
    vtextscale: 1,
  };
}

function SCR_TEXTTYPE(typer, x, y) {
  let TEXTSETUP = undefined;

  if (typer !== 0) {
    global.typer = typer;
  }

  switch (global.typer) {
    case 0:
      console.error("whys global.typer 0 wtf");
      break;

    case 1:
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        290,
        0,
        1,
        snd_txttor,
        8,
        18
      );
      break;

    case 5:
      TEXTSETUP = SCR_TEXTSETUP(
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        290,
        0,
        1,
        SND_TXT1,
        8,
        18
      );
      break;

    case 6:
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
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
      TEXTSETUP = SCR_TEXTSETUP(
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        290,
        0,
        1,
        snd_floweytalk1,
        8,
        18
      );
      break;

    case 10:
      TEXTSETUP = SCR_TEXTSETUP(
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        290,
        0,
        1,
        snd_nosound,
        8,
        18
      );
      break;

    case 11:
      TEXTSETUP = SCR_TEXTSETUP(
        fnt_maintext,
        c_white,
        x + 20,
        y + 20,
        290,
        0,
        2,
        SND_TXT2,
        9,
        18
      );
      break;
  }

  if (global.typer === 11 || global.typer === 112) {
    TEXTSETUP.textspeed = 2;
  }
  return TEXTSETUP;
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

function SCR_TEXT() {
  console.log("not doing allat yet")
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
  let q = 0;
  let r = 0;
  let alerm = 0;
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
    alerm = 0;
    this.naming = 5;
    caster_play(cy, 0.8, 0.95);
  }

  if (this.naming === 5) {
    alerm += 1

    if (q < 120) {
      q += 1;
    }

    var xx = this.name_x - (q / 3);

    draw_text_transformed(xx + random(r * 2), (q / 2) + this.name_y + random(r * 2), this.charname, 1 + (q / 50), 1 + (q / 50), random_ranger((-r * q) / 60, (r * q) / 60));

    if (alerm > 179)
    {
      instance_create(0, 0, obj_persistentfader);
      
      if (truereset > 0)
      {
        // TODO: save file
      }
      
      caster_free(cy);
      global.flag[5] = floor(random(100)) + 1;
      
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
      else if (this.hasname == 1 && truereset == 0 && !scr_hardmodename(global.this.charname))
      {
        this.spec_m = "A name has already#been chosen.";
        this.allow = 1;
      }
      else if (this.charname.toLowerCase() === "shayy") {
          this.spec_m = "shayy it's late, go to bed"
          this.allow = 0;
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
          if (this.hasname == 1 && truereset == 0)
            this.naming = 3;
          else
            this.naming = 1;
        }
          
        return;
      }
      
      draw_set_color(c_white);
      
      if (q < 120)
          q += 1;
      
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
      q = 0;
      r = 0.5;
      
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
      scr_drawtext_centered(160, this.title_y, "Name the fallen human."); // Name the fallen human.
  }

  if (this.naming === 3)
  {
      if (this.hasname == 1)
      {
          minutes = floor(time / 1800);
          seconds = round(((time / 1800) - minutes) * 60);
          
          if (seconds == 60)
              seconds = 0;
          
          if (seconds < 10)
              seconds = "0" + string(seconds);
          
          var roomname = scr_roomname(roome);
          var lvtext = "LOVE " + string(love);
          var timetext = "TIME " + string(minutes) + string(seconds);
          var namesize = substr(this.name, 1, 6).length;
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
              
              keyboard_clear(vk_left);
              keyboard_clear(vk_right);
          }
          
          if (keyboard_check_pressed(vk_down))
          {
              if (this.namingscreen_setup.selected3 == 0 || this.namingscreen_setup.selected3 == 1)
                  this.namingscreen_setup.selected3 = 2;
              
              keyboard_clear(vk_down);
          }
          
          if (keyboard_check_pressed(vk_up))
          {
              if (this.namingscreen_setup.selected3 == 2)
                  this.namingscreen_setup.selected3 = 0;
              
              keyboard_clear(vk_down);
          }
          
          var action = -1;
          
          if (control_check_pressed(0))
              action = this.namingscreen_setup.selected3;
          
          if (action == 0)
          {
              caster_free(all);
              
              if (ossafe_file_exists("file0") == 0)
                  room_goto_next();
              else
                  script_execute(scr_load);
          }
          
          if (action == 1)
          {
              if (this.hasname == 0 || scr_hardmodename(global.this.charname) || truereset > 0)
              {
                  this.naming = 1;
              }
              else
              {
                  this.charname = global.this.charname;
                  this.naming = 2;
                  alerm = 0;
                  r = 0.5;
                  q = 0;
              }
              
              control_clear(0);
          }
          
          if (action == 2)
          {
              caster_free(all);
              room_goto(room_settings);
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
  caster_loop,
  snd_play,
  snd_stop,
  SCR_TEXTSETUP,
  SCR_TEXTTYPE,
  SCR_NEWLINE,
  SCR_TEXT,
  scr_namingscreen_setup,
  scr_namingscreen_check,
  scr_namingscreen,
  random_ranger,
};
