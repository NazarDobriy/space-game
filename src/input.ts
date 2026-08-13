export class Input {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
  }

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }
}
