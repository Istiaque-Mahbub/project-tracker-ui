"use client";

import { getProjects } from "@/lib/api/projects";
import { useQuery } from "@tanstack/react-query";

export function useProjects(tenantId: string | null) {
  return useQuery({
    queryKey: ["projects", tenantId],
    queryFn: () => getProjects(tenantId!),
    enabled: Boolean(tenantId),
  });
}