const path_bedjump = {
	smooth: true,
	closed: false,
	precision: 4,
	points: {
		1: {x: 80, y: 96, speed: 100},
		2: {x: 100, y: 76, speed: 100},
		3: {x: 108, y: 88, speed: 100},
	}
}

const path_unbed = {
	smooth: true,
	closed: false,
	precision: 4,
	points: {
		1: {x: 80, y: 96, speed: 100},
		2: {x: 68, y: 96, speed: 100},
		3: {x: 48, y: 112, speed: 100},
	}
}

const path_hand1 = {
	smooth: true,
	closed: false,
	precision: 2,
	points: {
		1: {x: 32, y: 192, speed: 100},
		2: {x: 76, y: 216, speed: 100},
		3: {x: 88, y: 220, speed: 100},
		4: {x: 112, y: 224, speed: 100},
		5: {x: 132, y: 224, speed: 100},
		6: {x: 168, y: 216, speed: 100},
		7: {x: 192, y: 208, speed: 100},
		8: {x: 224, y: 196, speed: 100},
		9: {x: 264, y: 192, speed: 100},
	}
}

const path_hand2 = {
	smooth: true,
	closed: false,
	precision: 2,
	points: {
		1: {x: 260, y: 208, speed: 100},
		2: {x: 208, y: 192, speed: 100},
		3: {x: 188, y: 184, speed: 100},
		4: {x: 176, y: 180, speed: 100},
		5: {x: 156, y: 176, speed: 100},
		6: {x: 112, y: 176, speed: 100},
		7: {x: 96, y: 180, speed: 100},
		8: {x: 72, y: 188, speed: 100},
		9: {x: 16, y: 192, speed: 100},
	}
}

const path_slimedrop = {
	smooth: false,
	closed: true,
	precision: 4,
	points: {
		1: {x: 176, y: 128, speed: 100},
		2: {x: 192, y: 128, speed: 100},
		3: {x: 160, y: 128, speed: 100},
	}
}

const path_torielwalk1 = {
	smooth: false,
	closed: false,
	precision: 4,
	points: {
		1: {x: 140, y: 320, speed: 100},
		2: {x: 140, y: 220, speed: 100},
		3: {x: 240, y: 120, speed: 100},
		4: {x: 240, y: 90, speed: 100},
		5: {x: 216, y: 84, speed: 100},
		6: {x: 144, y: 84, speed: 100},
		7: {x: 146, y: 64, speed: 100},
	}
}

const path_torielwalk2 = {
	smooth: false,
	closed: false,
	precision: 4,
	points: {
		1: {x: 140, y: 100, speed: 100},
		2: {x: 220, y: 100, speed: 100},
		3: {x: 220, y: 60, speed: 100},
		4: {x: 180, y: 60, speed: 100},
		5: {x: 180, y: 40, speed: 100},
		6: {x: 195, y: 40, speed: 100},
	}
}

const path_torielwalk2_2 = {
	smooth: false,
	closed: false,
	precision: 4,
	points: {
		1: {x: 200, y: 40, speed: 100},
		2: {x: 125, y: 40, speed: 100},
		3: {x: 125, y: 80, speed: 100},
	}
}

const path_walkup = {
	smooth: false,
	closed: false,
	precision: 4,
	points: {
		1: {x: 160, y: 144, speed: 100},
		2: {x: 160, y: -128, speed: 100},
	}
}

export { path_bedjump, path_unbed, path_hand1, path_hand2, path_slimedrop, path_torielwalk1, path_torielwalk2, path_torielwalk2_2, path_walkup };