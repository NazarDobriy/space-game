import { Enemy } from "../enemy";

export type EnemyEvent =
  | {
      type: "destroyed";
      enemy: Enemy;
    }
  | {
      type: "killed";
      enemy: Enemy;
    };
