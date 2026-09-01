export type TacticsSport = 'default' | 'soccer' | 'basketball';

export type TacticsPlacement = {
  memberId: string;
  x: number; // 0–100 (% of board width)
  y: number; // 0–100 (% of board height)
};

export type TacticsBoardData = {
  sport: TacticsSport;
  placements: TacticsPlacement[];
};

export const TACTICS_SPORTS: Array<{
  id: TacticsSport;
  label: string;
  labelEn: string;
}> = [
  { id: 'default', label: '기본', labelEn: 'Default' },
  { id: 'soccer', label: '축구', labelEn: 'Soccer' },
  { id: 'basketball', label: '농구', labelEn: 'Basketball' },
];

export const DEFAULT_TACTICS_DATA: TacticsBoardData = {
  sport: 'default',
  placements: [],
};
