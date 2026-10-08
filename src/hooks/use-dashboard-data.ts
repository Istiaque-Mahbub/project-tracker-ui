"use client";

import { useMemo } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useActivities } from "@/hooks/use-activities";
import { useTasks } from "@/hooks/use-tasks";

export function useDashboardData(tenantId: string | null) {
  const projectsQuery = useProjects(tenantId);
  const activitiesQuery = useActivities(tenantId);

  const projects = projectsQuery.projects ?? [];

  /*
   * Fetch tasks for every project.
   */
  const taskQueries = projects.map((project) =>
    useTasks(tenantId, project.id)
  );

  const tasks = useMemo(() => {
    return taskQueries.flatMap((query) => query.data ?? []);
  }, [taskQueries]);

  const isLoading =
    projectsQuery.isLoading ||
    activitiesQuery.isLoading ||
    taskQueries.some((query) => query.isLoading);

  const isError =
    projectsQuery.isError ||
    activitiesQuery.isError ||
    taskQueries.some((query) => query.isError);

  return {
    projects,
    tasks,
    activities: activitiesQuery.data ?? [],
    isLoading,
    isError,
    projectsQuery,
    activitiesQuery,
    taskQueries,
  };
}