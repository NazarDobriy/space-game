import { Enemy } from "../enemy";

export type EnemyType = 'normal' | 'boss';

export type EnemyEvent =
  | {
      type: "destroyed";
      enemy: Enemy;
    }
  | {
      type: "killed";
      enemy: Enemy;
    };
