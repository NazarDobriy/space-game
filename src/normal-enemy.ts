import { Texture } from 'pixi.js';
import { Enemy } from './enemy';

export class NormalEnemy extends Enemy {
  constructor(texture: Texture, x: number, canvas: HTMLCanvasElement) {
    super(texture, x, canvas, 'normal');
    this.velocityY = 2;
  }
}
