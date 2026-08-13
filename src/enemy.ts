import { Texture } from "pixi.js";
import { GameObject } from "./game-object";
import { Observable } from "./patterns/Observable";
import { EnemyEvent, EnemyType } from "./types/enemy.types";

export class Enemy extends GameObject {
  health = 1;
  type: EnemyType = "normal";
  private canvas: HTMLCanvasElement | null = null;
  readonly events$ = new Observable<EnemyEvent>();

  protected constructor(texture: Texture, x: number, canvas: HTMLCanvasElement, type: EnemyType) {
    super(texture);

    this.x = x;
    this.y = 40;
    this.canvas = canvas;
    this.type = type;
  }

  override update(delta: number): void {
    super.update(delta);

    if (this.isOutOfScreen()) {
      this.events$.next({ type: 'destroyed', enemy: this });
    }
  };

  private isOutOfScreen(): boolean {
    return this.y > (this.canvas?.height || 0) + this.height;
  }
}
