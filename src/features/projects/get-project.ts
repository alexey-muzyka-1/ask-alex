import { failure, success, type Result } from "@/src/shared/result";
import { findProjectByName } from "@/src/features/projects/project-catalog";
import type { ProjectCard } from "@/src/features/projects/projects.types";

export function getProject(name: string): Result<ProjectCard> {
  const project = findProjectByName(name);

  if (!project) {
    return failure(
      "PROJECT_NOT_FOUND",
      `Project '${name}' was not found in the catalog`,
      false,
    );
  }

  return success(project);
}
