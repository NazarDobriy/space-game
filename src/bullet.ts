import { Texture } from "pixi.js";
import { GameObject } from "./game-object.js";

export class Bullet extends GameObject {
  constructor(texture: Texture, x: number, y: number) {
    super(texture);

    this.x = x;
    this.y = y - 15;

    this.velocityY = -10;
  }
}
