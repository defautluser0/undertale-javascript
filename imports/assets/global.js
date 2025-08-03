/// global
let global = {};

if (
  localStorage.getItem("global") !== null &&
  localStorage.getItem("global") !== ""
) {
  global = JSON.parse(localStorage.getItem("global"));
} else {
  global = {
    language: "en",
    control_state: [0, 0, 0],
    control_pressed: [0, 0, 0],
    control_new_state: [0, 0, 0],
    roomEnd: false,
    eventDone: true,
    nextRoom: null,
    msg: [],
    debug: 0,
    hp: 20,
    maxhp: 20,
    en: 20,
    maxen: 20,
    at: 10,
    df: 10,
    adef: 0,
    sp: 4,
    asp: 4,
    hb: 5,
    gt: 5,
    km: 0,
    ph: 0,
    gold: 0,
    xp: 0,
    lv: 1,
    area: 0,
    charname: "CHARA",
    item: [],
    spell: [],
    bulletvariable: [],
    menuno: -1,
    menucoord: [],
    bmenuno: 0,
    bmenucoord: [],
    areapop: [],
    flag: [],
    idealborder: [],
    plot: 0,
    currentroom: "room_introstory",
    monstername: [],
    monsterhp: [],
    monstermaxhp: [],
    monsterdef: [],
    xpreward: [],
    goldreward: [],
    itemrewardid: [],
    itemrewardchance: [],
    monster: [],
    monstertype: [],
    monsteratk: [],
    monsterinstance: [],
    attacker: [],
    mnpwr: [],
    bulletpwr: [],
    hurtanim: [],
    battlegroup: 3,
    turntimer: 0,
    talked: 0,
    inv: 20,
    invc: 0,
    turnmax: 0,
    myfight: 0,
    mnfight: 0,
    incombat: 0,
    firingrate: 14,
    border: 0,
    turn: 0,
    actfirst: 0,
    extraintro: 0,
    mytarget: 0,
    confirm: "ord('z')",
    damagetimer: 90,
    attacktype: 1,
    wstrength: 0,
    pwr: 0,
    attackspeed: 11,
    attackspeedr: 2,
    kills: 0,
    specialbattle: 0,
    myview: 0,
    hshake: 0,
    vshake: 0,
    shakespeed: 0,
    encounter: 0,
    facing: 0,
    phasing: 0,
    interact: 0,
    viewpan: 0,
    inbattle: 0,
    facechoice: 0,
    faceemotion: 0,
    seriousbattle: 0,
    mercy: 0,
    weapon: 3,
    armor: 4,
    choice: -1,
    lastsavedtime: 0,
    lastsavedkills: 0,
    lastsavedlv: 0,
    filechoice: 0,
    dontfade: 0,
    entrance: 0,
    currentsong: -1,
    currentsong2: -1,
    playing1: false,
    playing2: false,
    batmusic: -1,
    typer: 5,
    msc: 0,
    hardmode: 0,
    menuchoice: [],
    screen_border_id: 0,
    phone: [],
    choices: [],
  };

  for (let i = 0; i < 8; i += 1) {
    global.item[i] = 0;
    global.spell[i] = 1;
    global.bulletvariable[i] = 0;
    global.menuno = -1;
    global.menucoord[i] = 0;
    global.bmenuno = 0;
    global.bmenucoord[i] = 0;
    global.phone[i] = 0;
  }

  for (let i = 0; i < 24; i += 1) {
    global.areapop[i] = 0;
  }

  for (let i = 0; i < 99; i += 1) {
    global.msg[i] = "%%%";
  }

  for (let i = 0; i < 512; i += 1) {
    global.flag[i] = 0;
  }

  for (let i = 0; i < 3; i += 1) {
    global.monstername[i] = "Error";
    global.monsterhp[i] = 50;
    global.monstermaxhp[i] = 50;
    global.monsterdef[i] = 0;
    global.xpreward[i] = 0;
    global.goldreward[i] = 0;
    global.itemrewardid[i] = 0;
    global.itemrewardchance[i] = 0;
    global.monster[i] = 0;
    global.attacker[i] = 0;
    global.mnpwr[i] = 0;
    global.bulletpwr[i] = 0;
    global.hurtanim[i] = 0;
    global.monstertype[i] = -1;
  }

  global.menuchoice[0] = 1;
  global.menuchoice[1] = 1;
  global.menuchoice[2] = 0;
  global.menuchoice[3] = 0;

  localStorage.setItem("global", JSON.stringify(global));
}

if (window.navigator.userAgent === "MEOW Debugger") {
  global.debug = 1;
  globalThis.global = global;
} else {
  global.debug = 0;
}

if (!global.maskCache) {
  global.maskCache = {};

  const requiredMasks = {
    "/spr/masks/spr_maincharau_0.png": "/spr/masks/spr_maincharau_0.png",
    "/spr/masks/spr_maincharau_1.png": "/spr/masks/spr_maincharau_0.png",
    "/spr/masks/spr_maincharau_2.png": "/spr/masks/spr_maincharau_0.png",
    "/spr/masks/spr_maincharau_3.png": "/spr/masks/spr_maincharau_0.png",
    "/spr/masks/spr_maincharad_0.png": "/spr/masks/spr_maincharad_0.png",
    "/spr/masks/spr_maincharad_1.png": "/spr/masks/spr_maincharad_0.png",
    "/spr/masks/spr_maincharad_2.png": "/spr/masks/spr_maincharad_0.png",
    "/spr/masks/spr_maincharad_3.png": "/spr/masks/spr_maincharad_0.png",
    "/spr/masks/spr_maincharal_0.png": "/spr/masks/spr_maincharal_0.png",
    "/spr/masks/spr_maincharal_1.png": "/spr/masks/spr_maincharal_0.png",
    "/spr/masks/spr_maincharar_0.png": "/spr/masks/spr_maincharar_0.png",
    "/spr/masks/spr_maincharar_1.png": "/spr/masks/spr_maincharar_0.png",
    "/spr/masks/spr_doorA_0.png": "/spr/masks/spr_doorA_0.png",
    "/spr/masks/spr_doorB_0.png": "/spr/masks/spr_doorB_0.png",
    "/spr/masks/spr_doorC_0.png": "/spr/masks/spr_doorC_0.png",
    "/spr/masks/spr_doorD_0.png": "/spr/masks/spr_doorD_0.png",
    "/spr/masks/spr_doorX_0.png": "/spr/masks/spr_doorX_0.png",
  };

  for (const [path, filename] of Object.entries(requiredMasks)) {
    if (!global.maskCache[path]) {
      const img = new Image();
      img.src = `${filename}`;

      img.onload = () => {
        // Draw on canvas to get base64
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const base64 = canvas.toDataURL("image/png");

        // Store base64 and meta info in global.maskCache
        global.maskCache[path] = {
          loaded: true,
          base64,
          img,
          imageData,
        };
      };

      // Set a placeholder to avoid duplicate loading
      global.maskCache[path] = { loaded: false, base64: null };
    }
  }
}

for (const [, entry] of Object.entries(global.maskCache)) {
  if (entry.base64) {
    const img = new Image();
    img.src = entry.base64;

    img.onload = () => {
      entry.loaded = true;
      entry.img = img;
      const imgCanvas = document.createElement("canvas");
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      const imgCtx = imgCanvas.getContext("2d");
      imgCtx.drawImage(img, 0, 0);
      entry.imageData = imgCtx.getImageData(0, 0, img.width, img.height);
    };
  }
}

global._validHash =
  "b718f8223a5bb31979ffeed10be6140c857b882fc0d0462b89d6287ae38c81c7";
global._userHash = "";

export default global;
