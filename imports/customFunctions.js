import {
  audio_play_sound,
  audio_sound_gain,
  audio_sound_pitch,
  audio_stop_all,
  audio_stop_sound,
  round,
  currentFont,
  surface_get_width,
} from "/imports/assets/gamemakerFunctions.js";
import {
  draw_text,
  draw_text_transformed,
  draw_set_font,
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
} from "/imports/assets.js";
import global from "/imports/assets/global.js";
import { view_current, view_wview } from "/imports/view.js"

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

function scr_drawtext_centered_scaled(xx, yy, text, xscale, yscale) {
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

    draw_text_transformed(line_x, yy, line, xscale, yscale, 0);

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

function scr_drawtext_centered(xx, yy, text) {
  scr_drawtext_centered_scaled(xx, yy, text, 1, 1);
}


// scr_setfont
function scr_setfont(newfont) {
  if (global.language === "ja") {
    /* this will never happen rn */ if (newfont === fnt_main)
      newfont = fnt_main;
    if (newfont === fnt_maintext) newfont = fnt_maintext;
    if (newfont === fnt_plain) newfont = fnt_plain;
  }
  draw_set_font(newfont);
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
};
