
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createWorklog,
  deleteWorklog,
  getWorklogs,
  updateWorklog,
} from "@/lib/api/worklogs";

import type {
  CreateWorklogRequest,
  UpdateWorklogRequest,
} from "@/types/worklog";

export const worklogKeys = {
  all: (
    tenantId: string,
    projectId: string,
    taskId: string
  ) =>
    ["worklogs", tenantId, projectId, taskId] as const,
};

export function useWorklogs(
  tenantId: string,
  projectId: string,
  taskId: string
) {
  return useQuery({
    queryKey: worklogKeys.all(
      tenantId,
      projectId,
      taskId
    ),
    queryFn: () =>
      getWorklogs(tenantId, projectId, taskId),
    enabled: Boolean(tenantId && projectId && taskId),
  });
}

export function useWorklogActions(
  tenantId: string,
  projectId: string,
  taskId: string
) {
  const queryClient = useQueryClient();

  const queryKey = worklogKeys.all(
    tenantId,
    projectId,
    taskId
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorklogRequest) =>
      createWorklog(tenantId, projectId, taskId, data),
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      workLogId,
      data,
    }: {
      workLogId: string;
      data: UpdateWorklogRequest;
    }) =>
      updateWorklog(
        tenantId,
        projectId,
        taskId,
        workLogId,
        data
      ),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: (workLogId: string) =>
      deleteWorklog(
        tenantId,
        projectId,
        taskId,
        workLogId
      ),
    onSuccess: refresh,
  });

  return {
    createWorklog: createMutation.mutateAsync,
    updateWorklog: updateMutation.mutateAsync,
    deleteWorklog: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
