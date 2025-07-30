// mus_*
const mus_st_happytown = new Howl({
  src: ["/imports/assets/mus/st_happytown.ogg"]
});
const mus_st_meatfactory = new Howl({
  src: ["/imports/assets/mus/st_meatfactory.ogg"]
});
const mus_st_troubledingle = new Howl({
  src: ["/imports/assets/mus/st_troubledingle.ogg"]
});
const mus_st_him = new Howl({
	src: ["/imports/assets/mus/st_him.ogg"]
});
const mus_story = new Howl({
	src: ["/imports/assets/mus/story.ogg"]
});
const mus_intronoise = new Howl({
  src: ["/imports/assets/mus/intronoise.ogg"]
})
const mus_dance_of_dog = new Howl({
  src: ["/imports/assets/mus/dance_of_dog.ogg"]
})
const mus_sigh_of_dog = new Howl({
  src: ["/imports/assets/mus/sigh_of_dog.ogg"]
})
const mus_menu0 = new Howl({
  src: ["/imports/assets/mus/menu0.ogg"]
})
const mus_menu1 = new Howl({
  src: ["/imports/assets/mus/menu1.ogg"]
})
const mus_menu2 = new Howl({
  src: ["/imports/assets/mus/menu2.ogg"]
})
const mus_menu3 = new Howl({
  src: ["/imports/assets/mus/menu3.ogg"]
})
const mus_menu4 = new Howl({
  src: ["/imports/assets/mus/menu4.ogg"]
})
const mus_menu5 = new Howl({
  src: ["/imports/assets/mus/menu5.ogg"]
})
const mus_menu6 = new Howl({
  src: ["/imports/assets/mus/menu6.ogg"]
})
const mus_cymbal = new Howl({
  src: ["/imports/assets/mus/cymbal.ogg"]
})
const mus_ruins = new Howl({
  src: ["/imports/assets/mus/ruins.ogg"]
})
const mus_flowey = new Howl({
  src: ["/imports/assets/mus/flowey.ogg"]
})
const mus_harpnoise = new Howl({
  src: ["/imports/assets/mus/harpnoise.ogg"]
})
const mus_options_fall = new Howl({
  src: ["/imports/assets/mus/options_fall.ogg"]
})
const mus_options_summer = new Howl({
  src: ["/imports/assets/mus/options_summer.ogg"]
})
const mus_options_winter = new Howl({
  src: ["/imports/assets/mus/options_winter.ogg"]
})
const mus_toriel = new Howl({
  src: ["/imports/assets/mus/toriel.ogg"]
})
const mus_toomuch = new Howl({
  src: ["/imports/assets/mus/toomuch.ogg"]
})
const mus_battle1 = new Howl({
  src: ["/imports/assets/mus/battle1.ogg"]
})
const mus_prebattle1 = new Howl({
  src: ["/imports/assets/mus/prebattle1.ogg"]
})

// snd_*
const SND_TXT1 = new Howl({
	src: ["/imports/assets/snd/txt1.wav"]
})
const SND_TXT2 = new Howl({
	src: ["/imports/assets/snd/txt2.wav"]
})
const snd_txttor = new Howl({
	src: ["/imports/assets/snd/txttor.wav"]
})
const snd_txttor2 = new Howl({
	src: ["/imports/assets/snd/txttor2.wav"]
})
const snd_txttor3 = new Howl({
	src: ["/imports/assets/snd/txttor3.wav"]
})
const snd_floweytalk1 = new Howl({
  src: ["/imports/assets/snd/floweytalk1.wav"]
})
const snd_floweytalk2 = new Howl({
  src: ["/imports/assets/snd/floweytalk2.wav"]
})
const snd_nosound = new Howl({
  src: ["/imports/assets/snd/nosound.wav"]
})
const snd_ballchime = new Howl({
  src: ["/imports/assets/snd/ballchime.ogg"]
})
const snd_squeak = new Howl({
  src: ["/imports/assets/snd/squeak.wav"]
})
const snd_save = new Howl({
  src: ["/imports/assets/snd/save.wav"]
})
const snd_splash = new Howl({
  src: ["/imports/assets/snd/splash.wav"]
})
const snd_select = new Howl({
  src: ["/imports/assets/snd/select.wav"]
})
const snd_noise = new Howl({
  src: ["/imports/assets/snd/noise.wav"]
})
const snd_battlefall = new Howl({
  src: ["/imports/assets/snd/battlefall.wav"]
})
const snd_floweylaugh = new Howl({
  src: ["/imports/assets/snd/floweylaugh.wav"]
})
const snd_hurt1 = new Howl({
  src: ["/imports/assets/snd/hurt1.wav"]
})
const snd_chug = new Howl({
  src: ["/imports/assets/snd/chug.wav"]
})
const snd_heal_c = new Howl({
  src: ["/imports/assets/snd/heal_c.wav"]
})
const snd_power = new Howl({
  src: ["/imports/assets/snd/power.wav"]
})
const snd_txtsans = new Howl({
  src: ["/imports/assets/snd/txtsans.wav"]
})
const snd_txtsans2 = new Howl({
  src: ["/imports/assets/snd/txtsans2.wav"]
})
const snd_txtpap = new Howl({
  src: ["/imports/assets/snd/txtpap.wav"]
})
const snd_ehurt1 = new Howl({
  src: ["/imports/assets/snd/ehurt1.wav"]
})
const snd_phone = new Howl({
  src: ["/imports/assets/snd/phone.wav"]
})
const snd_wrongvictory = new Howl({
  src: ["/imports/assets/snd/wrongvictory.wav"]
})
const snd_screenshake = new Howl({
  src: ["/imports/assets/snd/screenshake.wav"]
})
const snd_damage = new Howl({
  src: ["/imports/assets/snd/damage.wav"]
})
const snd_slidewhist = new Howl({
  src: ["/imports/assets/snd/slidewhist.wav"]
})
const snd_levelup = new Howl({
  src: ["/imports/assets/snd/levelup.wav"]
})

// currently playing sounds map
const playingSounds = new Map();

export {
  mus_st_happytown,
  mus_st_him,
  mus_st_meatfactory,
  mus_st_troubledingle,
  mus_story,
  mus_intronoise,
  mus_dance_of_dog,
  mus_sigh_of_dog,
  mus_menu0,
  mus_menu1,
  mus_menu2,
  mus_menu3,
  mus_menu4,
  mus_menu5,
  mus_menu6,
  mus_cymbal,
  mus_ruins,
  mus_flowey,
  mus_harpnoise,
  mus_options_winter,
  mus_options_fall,
  mus_options_summer,
  mus_toriel,
  mus_toomuch,
  mus_prebattle1,
  mus_battle1,
  SND_TXT1,
  SND_TXT2,
  snd_txttor,
  snd_txttor2,
  snd_txttor3,
  snd_floweytalk1,
  snd_floweytalk2,
  snd_nosound,
  snd_ballchime,
  snd_squeak,
  snd_save,
  snd_splash,
  snd_select,
  snd_noise,
  snd_battlefall,
  snd_floweylaugh,
  snd_hurt1,
  snd_chug,
  snd_heal_c,
  snd_power,
  snd_txtsans,
  snd_txtsans2,
  snd_txtpap,
  snd_ehurt1,
  snd_phone,
  snd_wrongvictory,
  snd_screenshake,
  snd_damage,
  snd_slidewhist,
  snd_levelup,
  playingSounds,
};
