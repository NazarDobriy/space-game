import { Application, Assets, Container, Texture, Ticker, Text } from "pixi.js";
import { Player } from "./player";
import { Input } from "./input";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";
import { EnemyEvent } from "./types/enemy.types";
import { Observable } from "./patterns/Observable";

export class Game {
  private app: Application | null = null;
  private player: Player | null = null;
  private world: Container | null = null;
  private input: Input | null = null;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private bulletsContainer: Container | null = null;
  private enemiesContainer: Container | null = null;
  private bulletTexture: Texture | null = null;
  private enemyTexture: Texture | null = null;
  private enemySpawnTimer = 0;
  private score = 0;
  private score$ = new Observable<number>();
  private scoreText: Text | null = null;
  private readonly enemySpawnInterval = 1;

  constructor() {
    this.score$.subscribe((score: number) => {
      if (this.scoreText) {
        this.scoreText.text = `Score: ${score}`;
      }
    });
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

    this.scoreText = new Text({text: `Score: ${this.score}`, style: {
      fontFamily: "Arial",
      fill: "white",
      fontStyle: "italic",
      fontSize: 26,
    }});

    this.scoreText.x = 20;
    this.scoreText.y = 30;

    this.world.addChild(this.scoreText);

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
       const bullet = new Bullet(
        this.bulletTexture,
        this.player.x,
        this.player.y - 30
      );

      this.bullets.push(bullet);

      this.bulletsContainer?.addChild(bullet);

      bullet.destroyed$.subscribe((bullet: Bullet) => {
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
      const enemy = new Enemy(this.enemyTexture, Math.random() * this.app.screen.width, this.app.canvas);

      this.enemies.push(enemy);

      this.enemiesContainer.addChild(enemy);

      enemy.events$.subscribe(({ type, enemy }: EnemyEvent) => {
        switch (type) {
          case 'destroyed':
            this.removeEnemy(enemy);
            break;

          case 'killed':
            this.removeEnemy(enemy);
            this.score++;
            this.score$.next(this.score);
            break;
        };
      });
    }
  }

  private checkBulletEnemyCollisions(): void {
    for (const bullet of this.bullets) {
      for (const enemy of this.enemies) {
        if (bullet.isColliding(enemy)) {
          enemy.events$.next({
            type: 'killed',
            enemy
          });
          bullet.destroyed$.next(bullet);
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
