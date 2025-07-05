import { draw_text, draw_text_transformed, draw_set_font, global, fnt_main, fnt_maintext, fnt_plain } from '/imports/assets.js'
import { ctx } from '/imports/canvasSetup.js'

function scr_replace_buttons_pc(str) {
  return str
    .replaceAll("*Z", "[Z]")
    .replaceAll("*X", "[X]")
    .replaceAll("*C", "[C]")
    .replaceAll("*A", "[LEFT]")
    .replaceAll("*D", "[RIGHT]");
}

function scr_drawtext_centered_scaled(xx, yy, text, xscale, yscale) {
  var display_scale = 1; // No view/application surface scaling emulated here
  var fontSize = 24; // Match GML font size
  var lineheight = Math.round(fontSize * yscale);
  
  // Simulate line splitting by '#'
  var eol = text.indexOf("#");
  
  // Fix yy position rounded as in GML
  yy = Math.round(yy * display_scale) / display_scale;

  while (eol !== -1) {
    var line = text.substring(0, eol);
    text = text.substring(eol + 1);

    var width = ctx.measureText(line).width * xscale;
    var line_x = Math.round((xx - width / 2) * display_scale) / display_scale;

    draw_text_transformed(line_x, yy, line, xscale, yscale, 0);

    yy += lineheight;
    eol = text.indexOf("#");
  }

  // Draw last line
  var width = ctx.measureText(text).width * xscale;
  var line_x = Math.round((xx - width / 2) * display_scale) / display_scale;
  draw_text_transformed(line_x, yy, text, xscale, yscale, 0);
}

function scr_drawtext_icons_multiline(x0, y0, str, icon_scale = 1) {
  str = scr_replace_buttons_pc(str);
  const len = str.length;
  const lineHeight = parseInt(ctx.font) + 8;
  let outstr = "";
  let xx = x0;
  let yy = y0;

  for (let i = 0; i < len; i++) {
    if (str[i] === "#") {
      if (outstr !== "") {
        draw_text(xx, yy, outstr);
        outstr = "";
      }
      xx = x0;
      yy += lineHeight;
    } else if (str[i] === "*" && str[i + 2]) {
      if (outstr !== "") {
        draw_text(xx, yy, outstr);
        xx += ctx.measureText(outstr).width;
        outstr = "";
      }
      i += 2;
      const ch = str[i];
      const keyLabel = scr_replace_buttons_pc("*" + ch); // will be like [Z], [X], etc.
      draw_text(xx, yy, keyLabel);
      xx += ctx.measureText(keyLabel).width;
    } else {
      outstr += str[i];
    }
  }

  if (outstr !== "") {
    draw_text(xx, yy, outstr);
  }
}

function scr_drawtext_icons(xx, yy, str, icon_scale = 1) {
  str = scr_replace_buttons_pc(str);
  let i = str.indexOf("*");

  while (i !== -1) {
    if (i > 0) {
      const s = str.substring(0, i);
      draw_text(xx, yy, s);
      xx += ctx.measureText(s).width;
    }

    const ch = str[i + 2];
    const keyLabel = scr_replace_buttons_pc("*" + ch); // e.g., [X]
    draw_text(xx, yy, keyLabel);
    xx += ctx.measureText(keyLabel).width;

    str = str.substring(i + 3);
    i = str.indexOf("*");
  }

  if (str.length > 0) {
    draw_text(xx, yy, str);
  }
}

function scr_drawtext_centered(xx, yy, text) {
  scr_drawtext_centered_scaled(xx, yy, text, 1, 1);
}

// scr_setfont
function scr_setfont(newfont) {
  if (global.language === "ja") /* this will never happen rn */ {
    if (newfont === fnt_main) newfont = fnt_main;
    if (newfont === fnt_maintext) newfont = fnt_maintext;
    if (newfont === fnt_plain) newfont = fnt_plain;
  }
  draw_set_font(newfont);
}

export { scr_drawtext_icons, scr_drawtext_icons_multiline, scr_drawtext_centered, scr_drawtext_centered_scaled, scr_setfont }