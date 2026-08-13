import { Application, Assets, Container, Ticker } from "pixi.js";
import { Player } from "./player.js";
import { Input } from "./input.js";

export class Game {
  private app: Application | null = null;
  private player: Player | null = null;
  private world: Container | null = null;

  async start(): Promise<void> {
    this.app = new Application();

    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x30C790,
    });

    document.body.appendChild(this.app.canvas);

    this.world = new Container();

    this.app.stage.addChild(this.world);

    const input = new Input();
    const playerTexture = await Assets.load('/assets/spaceship.png');

    this.player = new Player(playerTexture, input, this.app.canvas);

    this.world.addChild(this.player);

    this.app.ticker.add((ticker: Ticker) => {
      this.update(ticker.deltaTime);
    });
  }

  private update(delta: number): void {
    if (this.player) {
      this.player.update(delta);
    }
  }
}
