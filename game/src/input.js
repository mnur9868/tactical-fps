// Input handling: keyboard, mouse, pointer lock
export function createInput(canvas, onLockChange) {
  const state = {
    keys: new Set(),
    mouseX: 0,
    mouseY: 0,
    firing: false,
    locked: false,
  };

  function onKeyDown(e) {
    if (!state.locked) return;
    state.keys.add(e.code);
    if (e.code === 'Escape') {
      canvas.requestPointerLock();
    }
  }

  function onKeyUp(e) {
    state.keys.delete(e.code);
  }

  function onMouseDown(e) {
    if (state.locked && e.button === 0) state.firing = true;
  }

  function onMouseUp(e) {
    if (e.button === 0) state.firing = false;
  }

  function onMouseMove(e) {
    if (!state.locked) return;
    state.mouseX = e.movementX;
    state.mouseY = e.movementY;
  }

  function onLockChange2() {
    const locked = document.pointerLockElement === canvas;
    state.locked = locked;
    if (!locked) {
      state.keys.clear();
      state.firing = false;
      state.mouseX = 0;
      state.mouseY = 0;
    }
    onLockChange(locked);
  }

  canvas.addEventListener('click', () => {
    if (!state.locked) canvas.requestPointerLock();
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onLockChange2);

  return {
    state,
    takeLook() {
      const x = state.mouseX;
      const y = state.mouseY;
      state.mouseX = 0;
      state.mouseY = 0;
      return { x, y };
    },
    requestLock() {
      canvas.requestPointerLock();
    },
    destroy() {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange2);
    },
  };
}