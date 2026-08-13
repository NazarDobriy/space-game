import { Texture } from "pixi.js";
import { GameObject } from "./game-object";
import { Observable } from "./patterns/Observable";

export class Bullet extends GameObject {
  readonly destroyed$ = new Observable<Bullet>();

  constructor(texture: Texture, x: number, y: number) {
    super(texture);

    this.x = x;
    this.y = y - 15;

    this.velocityY = -10;
  }

  override update(delta: number): void {
    super.update(delta);

    if (this.isOutOfScreen()) {
      this.destroyed$.next(this);
    }
  }

  private isOutOfScreen(): boolean {
    return this.y < -this.height;
  }
}
