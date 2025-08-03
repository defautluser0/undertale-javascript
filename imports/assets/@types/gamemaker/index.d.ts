// @ts-check

// types.ts. this is only for types in JSDoc in gamemakerFunctions.js. you do not need to compile this or do anything with it other than add types. please do not try to compile it, as i have not tested what it will do

declare type Real = number;
declare type Colour = string;
declare type Array2d<T> = T[][];
declare type Array3d<T> = T[][][];
declare type Struct = Object;
declare type Script = Function;
declare type Sprite = string;
declare type Background = string;
declare interface Obj {
  create(): Instance;
  createContext(): void;
  destroy?(): void;
  cleanUp?(): void;
  roomStart?(): void;
  roomEnd?(): void;
  beginStep?(): void;
  updateAlarms(): void;
  updateKeyboard?(): void;
  updateMouse?(): void;
  updateIndex(): void;
  step?(): void;
  outsideRoom?(): void;
  updateSpeed(): void;
  followPath(): void;
  updateCol(): void;
  endStep?(): void;
  preDraw?(): void;
  drawBegin?(): void;
  updateSprite(): void;
  draw?(): void;
  drawEnd?(): void;
  postDraw?(): void;
  drawGUIBegin?(): void;
  drawGUI?(): void;
  drawGUIEnd?(): void;
  animationEnd?(): void;
  user0?(): void;
  user1?(): void;
  user2?(): void;
  user3?(): void;
  user4?(): void;
  user5?(): void;
  user6?(): void;
  user7?(): void;
  user8?(): void;
  user9?(): void;
  user10?(): void;
  user11?(): void;
  user12?(): void;
  user13?(): void;
  user14?(): void;
  user15?(): void;
  user16?(): void;
  alarm0?(): void;
  alarm1?(): void;
  alarm2?(): void;
  alarm3?(): void;
  alarm4?(): void;
  alarm5?(): void;
  alarm6?(): void;
  alarm7?(): void;
  alarm8?(): void;
  alarm9?(): void;
  alarm10?(): void;
  alarm11?(): void;
}
declare interface PathAsset {
  smooth: boolean;
  closed: boolean;
  precision: Real;
  points: Object;
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
  data: PathAsset;
  index: Real;
  speed: Real;
  endaction: PathEndaction;
  absolute: boolean;
  xOffset: Real;
  yOffset: Real;
}
declare interface Instance extends Obj {
  name: string;
  depth: Real;
  image_xscale: Real;
  image_yscale: Real;
  image_alpha: Real;
  image_index: Real;
  image_speed: Real;
  image_number: Real;
  sprite_width: Real;
  sprite_height: Real;
  image_angle: Real;
  image_blend: Colour;
  sprite_index: Sprite;
  visible: boolean;
  friction: Real;
  gravity: Real;
  gravity_direction: Real;
  parent: Object;
  alarm: Array<Real>; // 12 entries
  hspeed: Real;
  vspeed: Real;
  speed: Real;
  direction: Real;
  path: Path;
  x: Real;
  y: Real;
  xstart: Real;
  ystart: Real;
  startx: Real;
  starty: Real;
  previousx: Real;
  xprevious: Real;
  previousy: Real;
  yprevious: Real;
  create2: true; // should always be true, will be removed later
  _object: Obj; // self
  _destroyed: boolean; // set by instance_destroy()
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
  file: string;
  size: Real;
  glyphs: Object;
  image: HTMLImageElement;
  loading: boolean;
}

declare type ID = string | Real;

interface FileBase {
  name: ID;
}
declare interface File extends FileBase {}
declare interface FileData extends FileBase {
  data: string;
}
declare interface FileLoaded extends FileBase {
  loaded: boolean;
}
declare interface FileLine extends FileBase {
  line: Real;
}

declare type KeyConstant = string;

declare type Room = string;
declare type RoomIndex = Real;

declare type DSGrid = Array2d<number>;

declare type DSMap<K, V> = Map<K, V>;

declare type Targetable = Obj | Instance;

declare interface Tileset {
  sprite: Sprite;
  width: Real;
  height: Real;
  xoffset: Real;
  yoffset: Real;
  xsep: Real;
  ysep: Real;
  xbord: Real;
  ybord: Real;
  gms2: Real;
}

declare interface TileData {
  tile_index: Real;
  hflip: boolean;
  vflip: boolean;
}

declare interface Buffer {
  data: ArrayBuffer;
  dv: DataView;
  size: Real;
  pos: Real;
  type: BufferType;
  alignment: Real;
  surfaceMap: Map<any, any>;
}
