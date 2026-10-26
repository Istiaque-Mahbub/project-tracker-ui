
import api from "../axios";
import type {
    CommentResponse,
    CreateCommentRequest,
    UpdateCommentRequest,
} from "@/types/comment";

const commentsUrl = (
    tenantId: string,
    projectId: string,
    taskId: string
) =>
    `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}/comments`;

export async function getTaskComments(
    tenantId: string,
    projectId: string,
    taskId: string
): Promise<CommentResponse[]> {
    const response = await api.get(
        commentsUrl(tenantId, projectId, taskId)
    );
    return response.data;
}

export async function getCommentById(
    tenantId: string,
    projectId: string,
    taskId: string,
    commentId: string
): Promise<CommentResponse> {
    const response = await api.get(
        `${commentsUrl(tenantId, projectId, taskId)}/${commentId}`
    );
    return response.data;
}

export async function createComment(
    tenantId: string,
    projectId: string,
    taskId: string,
    data: CreateCommentRequest
): Promise<CommentResponse> {
    const response = await api.post(
        commentsUrl(tenantId, projectId, taskId),
        data
    );
    return response.data;
}

export async function updateComment(
    tenantId: string,
    projectId: string,
    taskId: string,
    commentId: string,
    data: UpdateCommentRequest
): Promise<CommentResponse> {
    const response = await api.put(
        `${commentsUrl(tenantId, projectId, taskId)}/${commentId}`,
        data
    );
    return response.data;
}

export async function deleteComment(
    tenantId: string,
    projectId: string,
    taskId: string,
    commentId: string
): Promise<void> {
    await api.delete(
        `${commentsUrl(tenantId, projectId, taskId)}/${commentId}`
    );
}
