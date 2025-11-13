import endlessRaw from './endless-raw.json';

export interface BattleScene {
  enemyName: string;
  description: string;
  successMessage: string;
  failMessage: string;
}

export type BattleScenes = Record<string, BattleScene>;

export const battleScenes: BattleScenes = endlessRaw as BattleScenes;
