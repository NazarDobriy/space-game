import { Application, Assets, Container, Texture, Ticker } from "pixi.js";
import { Player } from "./player.js";
import { Input } from "./input.js";
import { Bullet } from "./bullet.js";

export class Game {
  private app: Application | null = null;
  private player: Player | null = null;
  private world: Container | null = null;
  private input: Input | null = null;
  private bullets: Bullet[] = [];
  private bulletsContainer: Container | null = null;
  private bulletTexture: Texture | null = null;

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
    const playerTexture = await Assets.load('/assets/spaceship.png');
    this.bulletTexture = await Assets.load('/assets/bullet.png');

    this.player = new Player(playerTexture, this.input, this.app.canvas);

    this.world.addChild(this.player);

    this.bulletsContainer = new Container();

    this.world.addChild(this.bulletsContainer);

    this.app.ticker.add((ticker: Ticker) => {
      this.update(ticker.deltaTime);
    });
  }

  private update(delta: number): void {
    if (this.player) {
      this.player.update(delta);
    }

    this.updateBullets(delta);

    this.handleShooting();

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
    }
  }

  private updateBullets(delta: number): void {
    for (const bullet of this.bullets) {
      bullet.update(delta);
    }

    this.removeInactiveBullets();
  }

  private removeInactiveBullets(): void {
    this.bullets = this.bullets.filter((bullet: Bullet) => {
      if (bullet.isOutOfScreen()) {
        this.bulletsContainer?.removeChild(bullet);
        bullet.destroy();
        return false;
      }

      return true;
    });
  }
}
