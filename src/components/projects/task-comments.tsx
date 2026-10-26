
"use client";

import { useState, type FormEvent } from "react";
import { MessageSquare, Pencil, Send, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getTaskComments,
    createComment,
    updateComment,
    deleteComment,
} from "@/lib/api/comments";

import type { CommentResponse } from "@/types/comment";

interface TaskCommentsProps {
    tenantId: string;
    projectId: string;
    taskId: string;
}

export function TaskComments({
    tenantId,
    projectId,
    taskId,
}: TaskCommentsProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");

    const commentsKey = ["task-comments", tenantId, projectId, taskId];

    const commentsQuery = useQuery({
        queryKey: commentsKey,
        queryFn: () => getTaskComments(tenantId, projectId, taskId),
        enabled: isOpen && Boolean(tenantId && projectId && taskId),
    });

    const refreshComments = () =>
        queryClient.invalidateQueries({ queryKey: commentsKey });

    const createMutation = useMutation({
        mutationFn: (commentContent: string) =>
            createComment(tenantId, projectId, taskId, {
                content: commentContent,
            }),
        onSuccess: async () => {
            setContent("");
            await refreshComments();
            toast.success("Comment added.");
        },
        onError: (error) => {
            console.error("Failed to add comment:", error);
            toast.error("Unable to add comment.");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            commentId,
            content,
        }: {
            commentId: string;
            content: string;
        }) =>
            updateComment(tenantId, projectId, taskId, commentId, {
                content,
            }),
        onSuccess: async () => {
            setEditingCommentId(null);
            setEditingContent("");
            await refreshComments();
            toast.success("Comment updated.");
        },
        onError: (error) => {
            console.error("Failed to update comment:", error);
            toast.error("Unable to update comment.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (commentId: string) =>
            deleteComment(tenantId, projectId, taskId, commentId),
        onSuccess: async () => {
            await refreshComments();
            toast.success("Comment deleted.");
        },
        onError: (error) => {
            console.error("Failed to delete comment:", error);
            toast.error("Unable to delete comment.");
        },
    });

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = content.trim();

        if (!trimmed) {
            toast.error("Enter a comment first.");
            return;
        }

        await createMutation.mutateAsync(trimmed);
    };

    const handleUpdate = async (
        event: FormEvent<HTMLFormElement>,
        commentId: string
    ) => {
        event.preventDefault();
        const trimmed = editingContent.trim();

        if (!trimmed) {
            toast.error("Comment cannot be empty.");
            return;
        }

        await updateMutation.mutateAsync({
            commentId,
            content: trimmed,
        });
    };

    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
            >
                <MessageSquare className="h-3.5 w-3.5" />
                {isOpen ? "Hide comments" : "Comments"}
                {isOpen && commentsQuery.data && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5">
                        {commentsQuery.data.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="mt-3 space-y-4 rounded-lg border bg-background p-4">
                    <form onSubmit={handleCreate} className="space-y-2">
                        <label
                            htmlFor={`comment-${taskId}`}
                            className="block text-sm font-medium"
                        >
                            Add a comment
                        </label>
                        <textarea
                            id={`comment-${taskId}`}
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Write a comment..."
                            rows={3}
                            maxLength={5000}
                            disabled={createMutation.isPending}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={
                                    !content.trim() || createMutation.isPending
                                }
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                                Post comment
                            </button>
                        </div>
                    </form>

                    <div className="border-t pt-3">
                        <h4 className="mb-3 text-sm font-semibold">
                            Discussion
                        </h4>

                        {commentsQuery.isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading comments...
                            </div>
                        ) : commentsQuery.isError ? (
                            <div>
                                <p className="text-sm text-destructive">
                                    Unable to load comments.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void commentsQuery.refetch()}
                                    className="mt-2 text-xs underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : commentsQuery.data?.length ? (
                            <div className="space-y-4">
                                {commentsQuery.data.map(
                                    (comment: CommentResponse) => (
                                        <article
                                            key={comment.id}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {comment.userName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCommentDate(
                                                            comment.createdAt
                                                        )}
                                                        {comment.updatedAt &&
                                                            comment.updatedAt !==
                                                            comment.createdAt &&
                                                            " · Edited"}
                                                    </p>
                                                </div>

                                                {editingCommentId !==
                                                    comment.id && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCommentId(
                                                                        comment.id
                                                                    );
                                                                    setEditingContent(
                                                                        comment.content
                                                                    );
                                                                }}
                                                                aria-label="Edit comment"
                                                                className="rounded-md p-1.5 hover:bg-muted"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (
                                                                        window.confirm(
                                                                            "Delete this comment?"
                                                                        )
                                                                    ) {
                                                                        deleteMutation.mutate(
                                                                            comment.id
                                                                        );
                                                                    }
                                                                }}
                                                                disabled={
                                                                    deleteMutation.isPending
                                                                }
                                                                aria-label="Delete comment"
                                                                className="rounded-md p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                            </div>

                                            {editingCommentId === comment.id ? (
                                                <form
                                                    onSubmit={(event) =>
                                                        void handleUpdate(
                                                            event,
                                                            comment.id
                                                        )
                                                    }
                                                    className="mt-3 space-y-2"
                                                >
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(event) =>
                                                            setEditingContent(
                                                                event.target.value
                                                            )
                                                        }
                                                        rows={3}
                                                        maxLength={5000}
                                                        disabled={
                                                            updateMutation.isPending
                                                        }
                                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCommentId(
                                                                    null
                                                                );
                                                                setEditingContent(
                                                                    ""
                                                                );
                                                            }}
                                                            disabled={
                                                                updateMutation.isPending
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                !editingContent.trim() ||
                                                                updateMutation.isPending
                                                            }
                                                            className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
                                                        >
                                                            {updateMutation.isPending
                                                                ? "Saving..."
                                                                : "Save"}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                                                    {comment.content}
                                                </p>
                                            )}
                                        </article>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No comments yet. Start the discussion.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatCommentDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleString();
}
