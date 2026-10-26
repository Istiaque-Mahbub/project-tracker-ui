
"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { useActivities } from "@/hooks/use-activities";

import type { ProjectResponse } from "@/types/project";
import type { TaskResponse } from "@/types/task";

export function useDashboard(tenantId: string | null) {
  /*
   * PROJECTS
   */

  const projectsQuery = useQuery<ProjectResponse[]>({
    queryKey: ["dashboard", "projects", tenantId],
    queryFn: () => {
      if (!tenantId) return Promise.resolve([]);
      return getProjects(tenantId);
    },
    enabled: Boolean(tenantId),
  });

  /*
   * ACTIVITIES
   * Use the existing activity hook.
   */

  const activitiesQuery = useActivities(tenantId);

  /*
   * TASKS
   */

  const projects = projectsQuery.data ?? [];
  const projectIds = projects.map((project) => project.id);

  const tasksQuery = useQuery<TaskResponse[]>({
    queryKey: ["dashboard", "tasks", tenantId, projectIds],
    queryFn: async () => {
      if (!tenantId || projectIds.length === 0) return [];

      const results = await Promise.all(
        projectIds.map((projectId) => getTasks(tenantId, projectId))
      );

      return results.flat();
    },
    enabled: Boolean(tenantId) && projectsQuery.isSuccess,
  });

  const tasks = tasksQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

  /*
   * TASK STATUS ENUM
   * Backlog = 0
   * Todo = 1
   * InProgress = 2
   * CodeReview = 3
   * Testing = 4
   * Completed = 5
   */

  const backlogTasks = tasks.filter((task) => task.status === 0);
  const todoTasks = tasks.filter((task) => task.status === 1);
  const inProgressTasks = tasks.filter((task) => task.status === 2);
  const codeReviewTasks = tasks.filter((task) => task.status === 3);
  const testingTasks = tasks.filter((task) => task.status === 4);
  const completedTasks = tasks.filter((task) => task.status === 5);

  /*
   * COMPLETION RATE
   */

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks.length / tasks.length) * 100);

  /*
   * TASKS DUE IN THE NEXT SEVEN DAYS
   */

  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);

  const dueThisWeek = tasks.filter((task) => {
    if (!task.dueDate || task.status === 5) return false;

    const dueDate = new Date(task.dueDate);

    return (
      !Number.isNaN(dueDate.getTime()) &&
      dueDate >= now &&
      dueDate <= sevenDaysFromNow
    );
  });

  /*
   * LOADING AND ERROR STATES
   */

  const isLoading =
    projectsQuery.isLoading ||
    activitiesQuery.isLoading ||
    tasksQuery.isLoading;

  const isError =
    projectsQuery.isError ||
    activitiesQuery.isError ||
    tasksQuery.isError;

  /*
   * REFRESH
   */

  const refetch = async () => {
    const results = await Promise.all([
      projectsQuery.refetch(),
      activitiesQuery.refetch(),
    ]);

    if (results[0].isSuccess) {
      await tasksQuery.refetch();
    }
  };

  return {
    projects,
    tasks,
    activities,

    backlogTasks,
    todoTasks,
    inProgressTasks,
    codeReviewTasks,
    testingTasks,
    completedTasks,

    completionRate,
    dueThisWeek,

    isLoading,
    isError,
    refetch,

    projectsQuery,
    tasksQuery,
    activitiesQuery,
  };
}
