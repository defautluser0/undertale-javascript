// types.ts. this is only for types in JSDoc in gamemakerFunctions.js. you do not need to compile this or do anything with it other than add types. please do not try to compile it, as i have not tested what it will do

declare type Real = number;
declare type String = string;
declare type Colour = string;
declare type Array2d<T> = T[][];
declare type Array3d<T> = T[][][];
declare type Struct = Object;
declare type Script = function;
declare type Sprite = string;
declare type Background = string;
declare type Boolean = boolean;
declare interface Obj {
	create(): Instance,
	createContext(): void,
	destroy?(): void,
	cleanUp?(): void,
	roomStart?(): void,
	roomEnd?(): void,
	beginStep?(): void,
	updateAlarms(): void,
	updateKeyboard?(): void,
	updateMouse?(): void,
	updateIndex(): void,
	step?(): void,
	outsideRoom?(): void,
	updateSpeed(): void,
	followPath(): void,
	updateCol(): void,
	endStep?(): void,
	preDraw?(): void,
	drawBegin?(): void,
	updateSprite(): void,
	draw?(): void,
	drawEnd?(): void,
	postDraw?(): void,
	drawGUIBegin?(): void,
	drawGUI?(): void,
	drawGUIEnd?(): void,
	animationEnd?(): void,
	user0?(): void,
	user1?(): void,
	user2?(): void,
	user3?(): void,
	user4?(): void,
	user5?(): void,
	user6?(): void,
	user7?(): void,
	user8?(): void,
	user9?(): void,
	alarm0?(): void,
	alarm1?(): void,
	alarm2?(): void,
	alarm3?(): void,
	alarm4?(): void,
	alarm5?(): void,
	alarm6?(): void,
	alarm7?(): void,
	alarm8?(): void,
	alarm9?(): void,
	alarm10?(): void,
	alarm11?(): void,
}
declare interface PathAsset {
	smooth: Boolean,
	closed: Boolean,
	precision: Real,
	points: Object,
}
declare enum PathEndaction {
	path_action_stop = "path_action_stop",
	path_action_restart = "path_action_restart",
	path_action_continue = "path_action_continue",
	path_action_reverse = "path_action_reverse",
}
declare enum BufferType {
	buffer_u8 = "buffer_u8",
	buffer_s8 = "buffer_s8",
	buffer_u16 = "buffer_u16",
	buffer_s16 = "buffer_s16",
	buffer_u32 = "buffer_u32",
	buffer_s32 = "buffer_s32",
	buffer_u64 = "buffer_u64",
	buffer_f16 = "buffer_f16",
	buffer_f32 = "buffer_f32",
	buffer_f64 = "buffer_f64",
	buffer_bool = "buffer_bool",
	buffer_string = "buffer_string",
	buffer_text = "buffer_text",
}
declare interface Path {
	data: PathAsset,
	index: Real,
	speed: Real,
	endaction: PathEndaction,
	absolute: Boolean,
	xOffset: Real,
	yOffset: Real,
}
declare interface Instance extends Obj {
	name: String,
	depth: Real,
	image_xscale: Real,
	image_yscale: Real,
	image_alpha: Real,
  image_index: Real,
  image_speed: Real,
  image_number: Real,
  sprite_width: Real,
  sprite_height: Real,
  image_angle: Real,
	image_blend: Colour,
	sprite_index: Sprite,
	visible: Boolean,
	friction: Real,
	gravity: Real,
	gravity_direction: Real,
	parent: Object,
	alarm: Array<Real>, // 12 entries
	hspeed: Real,
	vspeed: Real,
	speed: Real,
	direction: Real,
	path: Path,
	x: Real,
	y: Real,
	xstart: Real,
	ystart: Real,
	startx: Real,
	starty: Real,
	previousx: Real,
	xprevious: Real,
	previousy: Real,
	yprevious: Real,
	create2: true, // should always be true, will be removed later
	_object: Obj, // self
	_destroyed: Boolean, // set by instance_destroy()
}

declare interface Surface {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
}
declare type SurfaceId = Real;

// @ts-expect-error
declare type Sound = Howl;
declare type SoundInstance = Real;

declare interface Font {
	file: Real,
	size: Real,
	glyphs: Object,
	image: HTMLImageElement,
	loading: Boolean,
}

declare type ID = String | Real;

interface FileBase {
	name: ID,
}
declare interface File extends FileBase {};
declare interface FileData extends FileBase {
	data: String,
}
declare interface FileLoaded extends FileBase {
	loaded: Boolean,
}
declare interface FileLine extends FileBase {
	line: Real,
}

declare type KeyConstant = String;

declare type Room = String;
declare type RoomIndex = Real;

declare type DSGrid = Array2d<number>;

declare type DSMap<K, V> = Map<K, V>;

declare type Targetable = Obj | Instance;

declare interface Tileset {
	sprite: Sprite,
	width: Real,
	height: Real,
	xoffset: Real,
	yoffset: Real,
	xsep: Real,
	ysep: Real,
	xbord: Real,
	ybord: Real,
	gms2: Real,
}

declare interface TileData {
	tile_index: Real,
	hflip: Boolean,
	vflip: Boolean,
}

declare interface Buffer {
	data: ArrayBuffer,
	dv: DataView,
	size: Real,
	pos: Real,
	type: BufferType,
	alignment: Real,
	surfaceMap: Map,
}