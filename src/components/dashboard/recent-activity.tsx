import {
    CheckCircle2,
    GitCommitHorizontal,
    MessageSquare,
    UserPlus,
} from "lucide-react";

const activities = [
    {
        icon: CheckCircle2,
        title: "Task completed",
        description: "Authentication API was marked as completed",
        time: "5 min ago",
        color: "text-emerald-400 bg-emerald-500/10",
    },
    {
        icon: GitCommitHorizontal,
        title: "Project updated",
        description: "Developer Project Tracker received new changes",
        time: "18 min ago",
        color: "text-blue-400 bg-blue-500/10",
    },
    {
        icon: UserPlus,
        title: "New member",
        description: "A developer joined the workspace",
        time: "42 min ago",
        color: "text-violet-400 bg-violet-500/10",
    },
    {
        icon: MessageSquare,
        title: "New comment",
        description: "Someone commented on Dashboard UI",
        time: "1 hr ago",
        color: "text-amber-400 bg-amber-500/10",
    },
];

export default function RecentActivity() {
    return (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-white">
                    Recent activity
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Latest workspace events.
                </p>
            </div>

            <div className="space-y-5">
                {activities.map((activity) => {
                    const Icon = activity.icon;

                    return (
                        <div
                            key={activity.title}
                            className="flex items-start gap-3"
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.color}`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-semibold text-slate-300">
                                        {activity.title}
                                    </p>

                                    <span className="shrink-0 text-[9px] text-slate-700">
                                        {activity.time}
                                    </span>
                                </div>

                                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}