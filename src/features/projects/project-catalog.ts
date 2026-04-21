import projects from "@/src/content/projects.json";
import type { ProjectCard } from "@/src/features/projects/projects.types";

export function getProjectCatalog(): ProjectCard[] {
  return projects as ProjectCard[];
}

export function findProjectByName(name: string): ProjectCard | null {
  const normalizedInput = normalizeName(name);

  const matched = getProjectCatalog().find((project) => {
    const normalizedProject = normalizeName(project.name);
    return (
      normalizedProject === normalizedInput ||
      normalizedProject.includes(normalizedInput) ||
      normalizedInput.includes(normalizedProject)
    );
  });

  return matched ?? null;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}
