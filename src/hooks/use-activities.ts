
"use client";

import { useQuery } from "@tanstack/react-query";
import { getTenantActivities } from "@/lib/api/activities";

export function useActivities(tenantId: string | null) {
  return useQuery({
    queryKey: ["activities", tenantId],
    queryFn: () => {
      if (!tenantId) {
        throw new Error("Tenant ID is required to fetch activities.");
      }

      return getTenantActivities(tenantId);
    },
    enabled: Boolean(tenantId),
  });
}
