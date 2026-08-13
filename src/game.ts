import { Application, Assets, Container, Texture, Ticker, Text, Sprite } from "pixi.js";
import { Player } from "./player";
import { Input } from "./input";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";
import { EnemyEvent } from "./types/enemy.types";
import { Observable } from "./patterns/Observable";
import { textStyle } from "./text";
import { enemyFactory } from "./patterns/enemy-factory";

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
  private enemySpawnTimer = 0;
  private score = 0;
  private readonly score$ = new Observable<number>();
  private scoreText: Text | null = null;
  private readonly enemySpawnInterval = 1;
  private hearts = 3;
  private readonly hearts$ = new Observable<number>();
  private heartSprites: Sprite[] = [];
  private enemySpawnCount = 0;

  constructor() {
    this.score$.subscribe((score: number) => {
      if (this.scoreText) {
        this.scoreText.text = `Score: ${score}`;
      }
    });
    this.hearts$.subscribe((hearts: number) => {
      if (hearts <= 0) {
        this.gameOver();
      }
      this.heartSprites.pop()?.destroy();
    });
  }

  async start(): Promise<void> {
    this.app = new Application();

    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x30C790,
    });

    document.body.appendChild(this.app.canvas);

    this.app.ticker.add((ticker: Ticker) => {
      this.update(ticker.deltaTime);
    });

    this.showStartScreen();
  }

  private showStartScreen(): void {
    if (!this.app) {
      return;
    }

    const startContainer = new Container();

    startContainer.x = this.app.screen.width / 2;
    startContainer.y = this.app.screen.height / 2;

    const startText = new Text({
      text: 'Start Game',
      style: textStyle(60),
    });

    startText.anchor.set(0.5);

    startText.eventMode = 'static';
    startText.cursor = 'pointer';

    startContainer.addChild(startText);

    startText.on('click', () => {
      startContainer.destroy({
        children: true,
      });

      this.startGame();
    });

    this.app.stage.addChild(startContainer);
  }

  private addHeartSprites(heartTexture: Texture): void {
    if (!this.app || !this.world) {
      return;
    }
    
    for (let i = 0; i < this.hearts; i++) {
      const heartSprite = new Sprite(heartTexture);
      heartSprite.x = 20 + i * (heartSprite.width + 10);
      heartSprite.y = 70;
      this.heartSprites.push(heartSprite);
      this.world.addChild(heartSprite);
    }
  }

  private async startGame(): Promise<void> {
    if (!this.app) {
      return;
    }

    this.reset();

    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.input = new Input();

    const playerTexture = await Assets.load('/assets/spaceship.png');

    this.bulletTexture = await Assets.load('/assets/bullet.png');

    const heartTexture = await Assets.load('/assets/heart.png');

    this.player = new Player(
      playerTexture,
      this.input,
      this.app.canvas
    );

    this.world.addChild(this.player);

    this.bulletsContainer = new Container();
    this.enemiesContainer = new Container();

    this.world.addChild(this.bulletsContainer);
    this.world.addChild(this.enemiesContainer);

    this.addHeartSprites(heartTexture);

    this.scoreText = new Text({
      text: `Score: ${this.score}`,
      style: textStyle(26),
    });

    this.scoreText.x = 20;
    this.scoreText.y = 30;

    this.world.addChild(this.scoreText);

    this.app.ticker.start();
  }

  private async restart(): Promise<void> {
    if (!this.app) {
      return;
    }

    await this.startGame();
  }

  private reset(): void {
    this.hearts = 3;
    this.score = 0;
    this.bullets = [];
    this.enemies = [];
    this.enemySpawnTimer = 0;
    this.enemySpawnCount = 0;

    this.player = null;
    this.world = null;
    this.bulletsContainer = null;
    this.enemiesContainer = null;
    this.scoreText = null;

    this.heartSprites = [];

    this.app?.stage.removeChildren();
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

    this.checkPlayerEnemyCollisions();

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

  private async createEnemy(): Promise<void> {
    if (this.app && this.enemiesContainer) {
      this.enemySpawnCount++;

      const type = (this.enemySpawnCount + 1) % 5 === 0 ? 'boss' : 'normal';

      const enemy = await enemyFactory(
        type,
        Math.random() * this.app.screen.width,
        this.app.canvas,
      );

      this.enemies.push(enemy);

      this.enemiesContainer.addChild(enemy);

      enemy.events$.subscribe(({ type, enemy }: EnemyEvent) => {
        switch (type) {
          case 'destroyed':
            this.removeEnemy(enemy);
            enemy.type === 'normal' ? this.hearts-- : this.hearts -= 2;
            this.hearts$.next(this.hearts);
            break;

          case 'killed':
            const isBoss = enemy.type === 'boss';

            if (isBoss) {
              enemy.health -= 1;
              if (enemy.health <= 0) {
                this.removeEnemy(enemy);
                this.score += 5;
                this.score$.next(this.score);
              }
            } else {
              this.removeEnemy(enemy);
              this.score++;
              this.score$.next(this.score);
            }

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

  private checkPlayerEnemyCollisions(): void {
    if (!this.player) {
      return;
    }

    for (const enemy of this.enemies) {
      if (this.player.isColliding(enemy)) {
        enemy.events$.next({
          type: 'killed',
          enemy
        });
        this.hearts--;
        this.hearts$.next(this.hearts);
        break;
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

  private gameOver(): void {
    const finalScore = this.score;
    this.app?.ticker.stop();

    this.reset();

    if (this.app) {
      const gameOverContainer = new Container();
      gameOverContainer.x = this.app.canvas.width / 2;
      gameOverContainer.y = this.app.canvas.height / 2; 

      const endGameText = new Text({text: "Game is over", style: textStyle(60)});

      endGameText.x = gameOverContainer.width - endGameText.width / 2;
      endGameText.y = gameOverContainer.height - endGameText.height / 2 - 60;
      gameOverContainer.addChild(endGameText);

      const summaryText = new Text({
        text: `Your final score is: ${finalScore}`,
        style: textStyle(35),
      });

      summaryText.x = gameOverContainer.width - summaryText.width / 2 - 360;
      summaryText.y = gameOverContainer.height - summaryText.height / 2 - 50;
      gameOverContainer.addChild(summaryText);

      const restartText = new Text({
        text: "Click here to restart game",
        style: textStyle(35, {color: 0x000000, width: 6}),
      });

      restartText.x = gameOverContainer.width - restartText.width / 2 - 350;
      restartText.y = gameOverContainer.height - restartText.height / 2 - 50;

      restartText.eventMode = "static";
      restartText.cursor = "pointer";

      gameOverContainer.addChild(restartText);

      restartText.on('click', async () => this.restart());

      this.app.stage.addChild(gameOverContainer);
    }
  }
}
