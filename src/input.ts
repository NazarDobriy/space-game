export class Input {
  private keys = new Set<string>();
  private previousKeys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    window.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this.keys.add('MouseLeft');
      }
    });

    window.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        this.keys.delete('MouseLeft');
      }
    });
  }

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }

  wasPressed(key: string): boolean {
    return (
      this.keys.has(key) &&
      !this.previousKeys.has(key)
    );
  }

  update(): void {
    this.previousKeys = new Set(this.keys);
  }
}
