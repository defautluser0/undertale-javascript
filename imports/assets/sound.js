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

// currently playing sounds map
const playingSounds = new Map();

export {
  mus_st_happytown,
  mus_st_him,
  mus_st_meatfactory,
  mus_st_troubledingle,
  mus_story,
  mus_intronoise,
  SND_TXT1,
  SND_TXT2,
  snd_txttor,
  snd_floweytalk1,
  snd_floweytalk2,
  snd_nosound,
  snd_ballchime,
  playingSounds,
};
