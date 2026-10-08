
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/api/projects";

import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project";

export function useProjects(tenantId: string | null) {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["projects", tenantId],

    queryFn: () => {
      if (!tenantId) {
        return Promise.resolve([]);
      }

      return getProjects(tenantId);
    },

    enabled: Boolean(tenantId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => {
      if (!tenantId) {
        return Promise.reject(
          new Error("No tenant selected.")
        );
      }

      return createProject(tenantId, data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", tenantId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectRequest;
    }) => {
      if (!tenantId) {
        return Promise.reject(
          new Error("No tenant selected.")
        );
      }

      return updateProject(
        tenantId,
        projectId,
        data
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", tenantId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => {
      if (!tenantId) {
        return Promise.reject(
          new Error("No tenant selected.")
        );
      }

      return deleteProject(
        tenantId,
        projectId
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", tenantId],
      });
    },
  });

  return {
    projects: projectsQuery.data ?? [],

    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    error: projectsQuery.error,

    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    refetch: projectsQuery.refetch,
  };
}

