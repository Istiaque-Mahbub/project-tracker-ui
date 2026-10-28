import api from "../axios";
import type { ActivityResponse } from "@/types/activity";

export async function getTenantActivities(
    tenantId: string,
): Promise<ActivityResponse[]> {
    const response = await api.get<ActivityResponse[]>(
        `/api/tenants/${tenantId}/activities`,
    );

    return response.data;
}

export async function getProjectActivities(
    tenantId: string,
    projectId: string,
): Promise<ActivityResponse[]> {
    const response = await api.get<ActivityResponse[]>(
        `/api/tenants/${tenantId}/activities/projects/${projectId}`,
    );

    return response.data;
}

export async function getTaskActivities(
    tenantId: string,
    projectId: string,
    taskId: string,
): Promise<ActivityResponse[]> {
    const response = await api.get<ActivityResponse[]>(
        `/api/tenants/${tenantId}/activities/projects/${projectId}/tasks/${taskId}`,
    );

    return response.data;
}