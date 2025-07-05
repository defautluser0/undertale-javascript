import { global } from '/imports/assets.js'

// keyboard setup
const vk_left = "ArrowLeft";
const vk_right = "ArrowRight";
const vk_up = "ArrowUp";
const vk_down = "ArrowDown";
const keyboard = {}
const _key_state = {};
const _key_prev_state = {};

// control updates
function control_update() {
  global.control_new_state[0] = keyboard["KeyZ"] || keyboard["Enter"];
  global.control_new_state[1] = keyboard["KeyX"] || keyboard["ShiftLeft"] || keyboard["ShiftRight"];
  global.control_new_state[2] = keyboard["KeyC"] || keyboard["ControlLeft"] || keyboard["ControlRight"];

  for (let i = 0; i < 3; i++) {
    global.control_pressed[i] = !global.control_state[i] && global.control_new_state[i];
    global.control_state[i] = global.control_new_state[i];
  }
}

function control_clear(control) {
  if (control < 0 || control > 2) return;
  global.control_pressed[control] = 0;
}

function control_check_pressed(control) {
  if (control < 0 || control > 2) return 0;
  return global.control_pressed[control];
}

function control_check(control) {
  if (control < 0 || control > 2) return 0;
  return global.control_state[control];
}

function input_update() {
  for (const key in _key_state) {
    _key_prev_state[key] = _key_state[key];
  }
}

export { vk_down, vk_left, vk_right, vk_up, control_check,  control_check_pressed, control_clear, control_update, input_update, keyboard, _key_prev_state, _key_state }