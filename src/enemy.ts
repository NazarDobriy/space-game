import { Texture } from 'pixi.js';
import { GameObject } from './game-object';
import { Observable } from './patterns/Observable';
import { EnemyEvent } from './types/enemy.types';

export class Enemy extends GameObject {
  private canvas: HTMLCanvasElement | null = null;
  readonly events$ = new Observable<EnemyEvent>();

  constructor(texture: Texture, x: number, canvas: HTMLCanvasElement) {
    super(texture);

    this.x = x;
    this.canvas = canvas;
    this.y = 40;
    this.velocityY = 2;
  }

  override update(delta: number): void {
    super.update(delta);

    if (this.isOutOfScreen()) {
      this.events$.next({ type: 'destroyed', enemy: this });
    }
  }

  private isOutOfScreen(): boolean {
    return this.y > (this.canvas?.height || 0) + this.height;
  }
}
