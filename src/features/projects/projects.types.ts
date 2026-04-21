export type ProjectLink = {
  label: string;
  url: string;
};

export type ProjectCard = {
  name: string;
  role: string;
  cycleTime: string;
  handoff: string;
  description: string;
  links: ProjectLink[];
};
