import global from "/imports/assets/global.js";

const rooms = ["room_start" /* nonexistant, just so room 6 isnt area1_2 but ruins1. room actually exists in undertale */, "room_introstory", "room_introimage", "room_intromenu", "room_area1", "room_area1_2", "room_ruins1", "room_ruins2", "room_ruins3", "room_ruins4", "room_ruins5" ]

if (global.debug === 1) {
	globalThis.rooms = rooms;
}

export { rooms };