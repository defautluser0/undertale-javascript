/// sound setup
//// sound assets
const mus_st_happytown = new Howl({
  src: ["/imports/assets/mus/st_happytown.ogg"],
});
const mus_st_meatfactory = new Howl({
  src: ["/imports/assets/mus/st_meatfactory.ogg"],
});
const mus_st_troubledingle = new Howl({
  src: ["/imports/assets/mus/st_troubledingle.ogg"],
});
const mus_st_him = new Howl({
	src: ["/imports/assets/mus/st_him.ogg"]
});
const mus_story = new Howl({
	src: ["/imports/assets/mus/story.ogg"]
});
const SND_TXT1 = new Howl({
	src: ["/imports/assets/snd/txt1.ogg"]
})
const SND_TXT2 = new Howl({
	src: ["/imports/assets/snd/txt2.ogg"]
})
const snd_txttor = new Howl({
	src: ["/imports/assets/snd/txttor.ogg"]
})
const snd_floweytalk1 = new Howl({
  src:["/imports/assets/snd/floweytalk1.ogg"]
})
const snd_floweytalk2 = new Howl({
  src:["/imports/assets/snd/floweytalk2.ogg"]
})

//// playing
const playingSounds = new Map();

export {
  mus_st_happytown,
  mus_st_him,
  mus_st_meatfactory,
  mus_st_troubledingle,
  mus_story,
  SND_TXT1,
  SND_TXT2,
  snd_txttor,
  snd_floweytalk1,
  snd_floweytalk2,
  playingSounds,
};
