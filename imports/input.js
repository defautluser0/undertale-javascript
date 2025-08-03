import global from "/imports/assets/global.js";

// keyboard setup
export const vk_left = "ArrowLeft";
export const vk_right = "ArrowRight";
export const vk_up = "ArrowUp";
export const vk_down = "ArrowDown";
export const vk_escape = "Escape";
export const keyboard = {};
export const _key_state = {};
export const _key_prev_state = {};

// control updates
export function control_update() {
  global.control_new_state[0] = keyboard["KeyZ"] || keyboard["Enter"];
  global.control_new_state[1] =
    keyboard["KeyX"] || keyboard["ShiftLeft"] || keyboard["ShiftRight"];
  global.control_new_state[2] =
    keyboard["KeyC"] || keyboard["ControlLeft"] || keyboard["ControlRight"];

  for (let i = 0; i < 3; i++) {
    global.control_pressed[i] =
      !global.control_state[i] && global.control_new_state[i];
    global.control_state[i] = global.control_new_state[i];
  }
}

export function control_clear(control) {
  if (control < 0 || control > 2) return;
  global.control_pressed[control] = 0;
}

export function control_check_pressed(control) {
  if (control < 0 || control > 2) return 0;
  return global.control_pressed[control];
}

export function control_check(control) {
  if (control < 0 || control > 2) return 0;
  return global.control_state[control];
}

export function input_update() {
  for (const key in _key_state) {
    _key_prev_state[key] = _key_state[key];
  }
}
