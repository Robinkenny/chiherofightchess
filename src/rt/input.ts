export class InputController {
  keys = new Set<string>();
  joyX = 0;
  joyZ = 0;
  private stickEl: HTMLElement | null = null;
  private joyActive = false;
  private joyOrigin = { x: 0, y: 0 };

  bind() {
    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    this.setupJoystick();
  }

  getMoveVector(): { x: number; z: number } {
    let x = 0;
    let z = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) z -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) z += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    x += this.joyX;
    z += this.joyZ;
    return { x, z };
  }

  private setupJoystick() {
    const wrap = document.getElementById('joystick');
    const stick = document.getElementById('joy-stick');
    if (!wrap || !stick) return;
    this.stickEl = stick;

    const start = (cx: number, cy: number) => {
      this.joyActive = true;
      const r = wrap.getBoundingClientRect();
      this.joyOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      this.moveStick(cx, cy);
    };
    const move = (cx: number, cy: number) => {
      if (this.joyActive) this.moveStick(cx, cy);
    };
    const end = () => {
      this.joyActive = false;
      this.joyX = 0;
      this.joyZ = 0;
      stick.style.transform = 'translate(-50%, -50%)';
    };

    wrap.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (!this.joyActive) return;
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: false });
    window.addEventListener('touchend', end);

    wrap.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', end);
  }

  private moveStick(cx: number, cy: number) {
    if (!this.stickEl) return;
    const max = 42;
    let dx = cx - this.joyOrigin.x;
    let dy = cy - this.joyOrigin.y;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    this.stickEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    this.joyX = dx / max;
    this.joyZ = dy / max;
  }
}
