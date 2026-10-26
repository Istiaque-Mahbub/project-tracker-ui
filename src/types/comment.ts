
export interface CommentResponse {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentRequest {
    content: string;
}

export interface UpdateCommentRequest {
    content: string;
}
