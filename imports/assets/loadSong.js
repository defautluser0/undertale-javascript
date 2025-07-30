import global from "/imports/assets/global.js";
import * as sounds from "/imports/assets/sound.js";

function loadCurrentSong(key, playing) {
  const songData = global[key];
  if (!songData || typeof songData !== "object" || !songData.name) return;

  const howl = sounds[songData.name];
  if (!howl) {
    console.warn(`Sound ${songData.name} not found in assets`);
    return;
  }

  global[key] = howl;
  // Apply saved settings
	const id = howl.play();
  howl.volume(songData.volume, id);
  howl.rate(songData.rate, id);
  howl.loop(songData.loop);
  howl.seek(songData.pos, id);
  if (!playing) howl.pause(id);
}

export { loadCurrentSong };