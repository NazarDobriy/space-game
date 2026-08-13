import { Assets } from "pixi.js";
import { BossEnemy } from "../boss-enemy";
import { Enemy } from "../enemy";
import { NormalEnemy } from "../normal-enemy";
import { EnemyType } from "../types/enemy.types";

export async function enemyFactory(
  type: EnemyType,
  x: number,
  canvas: HTMLCanvasElement
): Promise<Enemy> {
  switch (type) {
    case "normal":
      const enemyTexture = await Assets.load("/assets/alien.png");
      return new NormalEnemy(enemyTexture, x, canvas);
    case "boss":
      const bossTexture = await Assets.load("/assets/boss.png");
      return new BossEnemy(bossTexture, x, canvas);
  }
}
