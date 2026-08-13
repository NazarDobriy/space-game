import { Texture } from 'pixi.js';
import { GameObject } from './game-object.js';

export class Enemy extends GameObject {
  private canvas: HTMLCanvasElement | null = null;

  constructor(texture: Texture, x: number, canvas: HTMLCanvasElement) {
    super(texture);

    this.x = x;
    this.canvas = canvas;
    this.y = 40;
    this.velocityY = 2;
  }

  isOutOfScreen(): boolean {
    return this.y > (this.canvas?.height || 0) + this.height;
  }
}
