
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask as createTaskApi,
  getTasks,
  updateTask as updateTaskApi,
  assignTask as assignTaskApi,
} from "@/lib/api/tasks";

import type {
  AssignTaskRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types/task";

export function useTasks(
  tenantId: string | null,
  projectId: string | null
) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", tenantId, projectId];

  const tasksQuery = useQuery({
    queryKey,
    queryFn: () => {
      if (!tenantId || !projectId) return Promise.resolve([]);
      return getTasks(tenantId, projectId);
    },
    enabled: Boolean(tenantId && projectId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => {
      if (!tenantId || !projectId) {
        throw new Error("No tenant or project selected.");
      }

      return createTaskApi(tenantId, projectId, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskRequest;
    }) => {
      if (!tenantId || !projectId) {
        throw new Error("No tenant or project selected.");
      }

      return updateTaskApi(tenantId, projectId, taskId, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const assignMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: AssignTaskRequest;
    }) => {
      if (!tenantId || !projectId) {
        throw new Error("No tenant or project selected.");
      }

      return assignTaskApi(tenantId, projectId, taskId, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,

    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateTask: updateMutation.mutateAsync,
    isUpdatingTask: updateMutation.isPending,

    assignTask: assignMutation.mutateAsync,
    isAssigningTask: assignMutation.isPending,
  };
}
