"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/lib/api/projects";
import { getTasks } from "@/lib/api/tasks";
import { getActivities } from "@/lib/api/activities";

import { ProjectResponse } from "@/types/project";
import { TaskResponse } from "@/types/task";
import { ActivityLogResponse } from "@/types/activity";

export function useDashboard(tenantId: string | null) {
  /*
   * ----------------------------------------
   * PROJECTS
   * ----------------------------------------
   */

  const projectsQuery = useQuery<ProjectResponse[]>({
    queryKey: ["dashboard", "projects", tenantId],

    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve([]);
      }

      return getProjects(tenantId);
    },

    enabled: Boolean(tenantId),
  });

  /*
   * ----------------------------------------
   * ACTIVITIES
   * ----------------------------------------
   */

  const activitiesQuery = useQuery<ActivityLogResponse[]>({
    queryKey: ["dashboard", "activities", tenantId],

    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve([]);
      }

      return getActivities(tenantId);
    },

    enabled: Boolean(tenantId),
  });

  /*
   * ----------------------------------------
   * TASKS
   * ----------------------------------------
   *
   * We only request tasks when projects
   * actually exist.
   */

  const projects = projectsQuery.data ?? [];

  const projectIds = projects.map(
    (project) => project.id
  );

  const tasksQuery = useQuery<TaskResponse[]>({
    queryKey: [
      "dashboard",
      "tasks",
      tenantId,
      projectIds,
    ],

    queryFn: async () => {
      if (!tenantId || projectIds.length === 0) {
        return [];
      }

      const taskResults = await Promise.all(
        projectIds.map((projectId) =>
          getTasks(tenantId, projectId)
        )
      );

      return taskResults.flat();
    },

    enabled:
      Boolean(tenantId) &&
      projectsQuery.isSuccess,
  });

  /*
   * ----------------------------------------
   * FINAL DATA
   * ----------------------------------------
   */

  const activities =
    activitiesQuery.data ?? [];

  const tasks =
    tasksQuery.data ?? [];

  /*
   * ----------------------------------------
   * STATISTICS
   * ----------------------------------------
   */

  const completedTasks = tasks.filter(
    (task) =>
      task.status.toLowerCase() ===
      "completed"
  );

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status.toLowerCase() ===
      "inprogress" ||
      task.status.toLowerCase() ===
      "in_progress"
  );

  const todoTasks = tasks.filter(
    (task) =>
      task.status.toLowerCase() ===
      "todo"
  );

  /*
   * ----------------------------------------
   * COMPLETION RATE
   * ----------------------------------------
   */

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            tasks.length) *
            100
        );

  /*
   * ----------------------------------------
   * DUE TASKS
   * ----------------------------------------
   */

  const now = new Date();

  const sevenDaysFromNow =
    new Date(now);

  sevenDaysFromNow.setDate(
    now.getDate() + 7
  );

  const dueThisWeek = tasks.filter(
    (task) => {
      if (!task.dueDate) {
        return false;
      }

      const dueDate =
        new Date(task.dueDate);

      return (
        dueDate >= now &&
        dueDate <= sevenDaysFromNow &&
        task.status.toLowerCase() !==
          "completed"
      );
    }
  );

  /*
   * ----------------------------------------
   * LOADING
   * ----------------------------------------
   */

  const isLoading =
    projectsQuery.isLoading ||
    activitiesQuery.isLoading ||
    tasksQuery.isLoading;

  /*
   * ----------------------------------------
   * ERROR
   * ----------------------------------------
   */

  const isError =
    projectsQuery.isError ||
    activitiesQuery.isError ||
    tasksQuery.isError;

  return {
    projects,
    tasks,
    activities,

    completedTasks,
    inProgressTasks,
    todoTasks,

    completionRate,
    dueThisWeek,

    isLoading,
    isError,

    projectsQuery,
    tasksQuery,
    activitiesQuery,
  };
}