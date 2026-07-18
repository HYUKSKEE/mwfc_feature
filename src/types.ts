export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type Member = {
  id: string;
  name: string;
  skill: SkillLevel;
  teamId: string | null;
};

export type Team = {
  id: string;
  name: string;
};

export type AppData = {
  members: Member[];
  teams: Team[];
};
