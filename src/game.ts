import { Application, Assets, Container, Texture, Ticker } from "pixi.js";
import { Player } from "./player.js";
import { Input } from "./input.js";
import { Bullet } from "./bullet.js";
import { Enemy } from "./enemy.js";
import { EnemyEvent } from "./types/enemy.types.js";

export class Game {
  private app: Application | null = null;
  private player: Player | null = null;
  private world: Container | null = null;
  private input: Input | null = null;
  private bullets: Bullet[] = [];
  private bullet: Bullet | null = null;
  private enemies: Enemy[] = [];
  private bulletsContainer: Container | null = null;
  private enemiesContainer: Container | null = null;
  private bulletTexture: Texture | null = null;
  private enemyTexture: Texture | null = null;
  private enemySpawnTimer = 0;
  private score = 0;
  private enemy: Enemy | null = null;
  private readonly enemySpawnInterval = 1;

  constructor() {
    
  }

  async start(): Promise<void> {
    this.app = new Application();

    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x30C790,
    });

    document.body.appendChild(this.app.canvas);

    this.world = new Container();

    this.app.stage.addChild(this.world);

    this.input = new Input();

    this.enemyTexture = await Assets.load('/assets/alien.png');
    const playerTexture = await Assets.load('/assets/spaceship.png');
    this.bulletTexture = await Assets.load('/assets/bullet.png');

    this.player = new Player(playerTexture, this.input, this.app.canvas);

    this.world.addChild(this.player);

    this.bulletsContainer = new Container();
    this.enemiesContainer = new Container();

    this.world.addChild(this.bulletsContainer);
    this.world.addChild(this.enemiesContainer);

    this.app.ticker.add((ticker: Ticker) => {
      this.update(ticker.deltaTime);
    });
  }

  private update(delta: number): void {
    if (this.player) {
      this.player.update(delta);
    }

    this.updateBullets(delta);

    this.updateEnemies(delta);

    this.spawnEnemies(delta);

    this.handleShooting();

    this.checkBulletEnemyCollisions();

    this.input?.update();
  }

  private handleShooting(): void {
    if (this.input?.wasPressed('Space') || this.input?.wasPressed('MouseLeft')) {
      this.shoot();
    }
  }

  private shoot(): void {
    if (this.player && this.bulletTexture) {
       this.bullet = new Bullet(
        this.bulletTexture,
        this.player.x,
        this.player.y - 30
      );

      this.bullets.push(this.bullet);

      this.bulletsContainer?.addChild(this.bullet);

      this.bullet.destroyed$.subscribe((bullet: Bullet) => {
        this.removeBullet(bullet);
      });
    }
  }

  private updateBullets(delta: number): void {
    for (const bullet of this.bullets) {
      bullet.update(delta);
    }
  }

  private updateEnemies(delta: number): void {
    for (const enemy of this.enemies) {
      enemy.update(delta);
    }
  }

  private spawnEnemies(delta: number): void {
    this.enemySpawnTimer += delta / 60;

    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;

      this.createEnemy();
    }
  }

  private createEnemy(): void {
    if (this.app && this.enemiesContainer && this.enemyTexture) {
      this.enemy = new Enemy(this.enemyTexture, Math.random() * this.app.screen.width, this.app.canvas);

      this.enemies.push(this.enemy);

      this.enemiesContainer.addChild(this.enemy);

      this.enemy.events$.subscribe((event: EnemyEvent) => {
        switch (event.type) {
          case 'destroyed':
            this.removeEnemy(event.enemy);
            break;

          case 'killed':
            this.removeEnemy(event.enemy);
            this.score++;
            break;
        };
      });
    }
  }

  private checkBulletEnemyCollisions(): void {
    for (const bullet of this.bullets) {
      for (const enemy of this.enemies) {
        if (bullet.isColliding(enemy)) {
          this.enemy?.events$.next({ type: 'killed', enemy: enemy });
          this.bullet?.destroyed$.next(bullet);
          break;
        }
      }
    }
  }

  private removeBullet(bullet: Bullet): void {
    this.bulletsContainer?.removeChild(bullet);
    bullet.destroy();

    this.bullets = this.bullets.filter(
      (item: Bullet) => item !== bullet
    );
  }

  private removeEnemy(enemy: Enemy): void {
    this.enemiesContainer?.removeChild(enemy);
    enemy.destroy();

    this.enemies = this.enemies.filter(
      (item: Enemy) => item !== enemy
    );
  }
}
