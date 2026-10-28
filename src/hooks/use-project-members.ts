
"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectMembers } from "@/lib/api/project-members";

export function useProjectMembers(
  tenantId: string | null,
  projectId: string | null
) {
  const query = useQuery({
    queryKey: ["project-members", tenantId, projectId],
    queryFn: () => {
      if (!tenantId || !projectId) {
        return Promise.resolve([]);
      }

      return getProjectMembers(tenantId, projectId);
    },
    enabled: Boolean(tenantId && projectId),
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
