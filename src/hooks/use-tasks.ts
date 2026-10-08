"use client";

import { getTasks } from "@/lib/api/tasks";
import { useQuery } from "@tanstack/react-query";

export function useTasks(
  tenantId: string | null,
  projectId: string | null
) {
  return useQuery({
    queryKey: ["tasks", tenantId, projectId],
    queryFn: () => getTasks(tenantId!, projectId!),
    enabled: Boolean(tenantId && projectId),
  });
}