import { Texture } from 'pixi.js';
import { GameObject } from './game-object';
import { Input } from './input';

export class Player extends GameObject {
  private readonly speed = 6;
  private canvas: HTMLCanvasElement | null = null;

  constructor(texture: Texture, private readonly input: Input, canvas: HTMLCanvasElement) {
    super(texture);

    this.canvas = canvas;
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

    this.checkBounds();
  }

  private checkBounds(): void {
    if (!this.canvas) {
      return;
    }

    const border = 34;

    if (this.y < border) {
      this.y = 34;
    }

    if (this.y > this.canvas.height - border) {
      this.y = this.canvas.height - border;
    }

    if (this.x < 0) {
      this.x = this.canvas.width;
    }

    if (this.x > this.canvas.width) {
      this.x = 0;
    }
  }
}
