import { Texture } from "pixi.js";
import { Enemy } from "./enemy";

export class BossEnemy extends Enemy {
  health = 3;

  constructor(texture: Texture, x: number, canvas: HTMLCanvasElement) {
    super(texture, x, canvas, 'boss');
    this.velocityY = 1;
  }

  update(delta: number): void {
    super.update(delta);
  }
}
