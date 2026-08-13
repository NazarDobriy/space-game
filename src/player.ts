import { Texture } from 'pixi.js';
import { GameObject } from './game-object.js';
import { Input } from './input.js';

export class Player extends GameObject {
  private readonly speed = 6;

  constructor(texture: Texture, private readonly input: Input, canvas: HTMLCanvasElement) {
    super(texture);

    this.x = canvas.width / 2;
    this.y = canvas.height / 2 + 100;
  }

  update(delta: number): void {
    this.velocityX = 0;
    this.velocityY = 0;

    if (this.input.isPressed('ArrowLeft') || this.input.isPressed('KeyA')) {
      this.velocityX = -this.speed;
    }

    if (this.input.isPressed('ArrowRight') || this.input.isPressed('KeyD')) {
      this.velocityX = this.speed;
    }

    if (this.input.isPressed('ArrowDown') || this.input.isPressed('KeyS')) {
      this.velocityY = this.speed;
    }

    if (this.input.isPressed('ArrowUp') || this.input.isPressed('KeyW')) {
      this.velocityY = -this.speed;
    }

    super.update(delta);
  }
}
