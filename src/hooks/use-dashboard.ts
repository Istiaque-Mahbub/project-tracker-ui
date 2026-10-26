
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
   * Fetch tasks after projects load.
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

  const activities = activitiesQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  /*
   * ----------------------------------------
   * TASK STATUS STATISTICS
   * ----------------------------------------
   *
   * C# TaskStatus enum:
   * Backlog    = 0
   * Todo       = 1
   * InProgress = 2
   * CodeReview = 3
   * Testing    = 4
   * Completed  = 5
   */

  const BACKLOG_STATUS = 0;
  const TODO_STATUS = 1;
  const IN_PROGRESS_STATUS = 2;
  const CODE_REVIEW_STATUS = 3;
  const TESTING_STATUS = 4;
  const COMPLETED_STATUS = 5;

  const backlogTasks = tasks.filter(
    (task) => task.status === BACKLOG_STATUS
  );

  const todoTasks = tasks.filter(
    (task) => task.status === TODO_STATUS
  );

  const inProgressTasks = tasks.filter(
    (task) => task.status === IN_PROGRESS_STATUS
  );

  const codeReviewTasks = tasks.filter(
    (task) => task.status === CODE_REVIEW_STATUS
  );

  const testingTasks = tasks.filter(
    (task) => task.status === TESTING_STATUS
  );

  const completedTasks = tasks.filter(
    (task) => task.status === COMPLETED_STATUS
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
          (completedTasks.length / tasks.length) * 100
        );

  /*
   * ----------------------------------------
   * DUE TASKS
   * ----------------------------------------
   */

  const now = new Date();

  const sevenDaysFromNow = new Date(now);

  sevenDaysFromNow.setDate(
    now.getDate() + 7
  );

  const dueThisWeek = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const dueDate = new Date(task.dueDate);

    const isWithinNextSevenDays =
      dueDate >= now &&
      dueDate <= sevenDaysFromNow;

    const isNotCompleted =
      task.status !== COMPLETED_STATUS;

    return isWithinNextSevenDays && isNotCompleted;
  });

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

  /*
   * ----------------------------------------
   * RETURN DASHBOARD DATA
   * ----------------------------------------
   */

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

    projectsQuery,
    tasksQuery,
    activitiesQuery,
  };
}