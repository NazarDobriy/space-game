import { Sprite, Texture } from 'pixi.js';

export abstract class GameObject extends Sprite {
  velocityX = 0;
  velocityY = 0;

  constructor(texture: Texture) {
    super(texture);

    this.anchor.set(0.5);
  }

  update(delta: number): void {
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;
  }
}
