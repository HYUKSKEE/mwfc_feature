export type Member = {
  id: string;
  name: string;
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
