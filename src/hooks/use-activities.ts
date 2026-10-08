"use client";

import { getActivities } from "@/lib/api/activities";
import { useQuery } from "@tanstack/react-query";

export function useActivities(tenantId: string | null) {
  return useQuery({
    queryKey: ["activities", tenantId],
    queryFn: () => getActivities(tenantId!),
    enabled: Boolean(tenantId),
  });
}