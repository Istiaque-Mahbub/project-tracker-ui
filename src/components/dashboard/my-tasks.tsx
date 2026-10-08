import {
    ArrowUpRight,
    Circle,
    CircleCheck,
    Clock3,
} from "lucide-react";

const tasks = [
    {
        title: "Finish authentication flow",
        project: "Developer Project Tracker",
        priority: "High",
        due: "Today",
        completed: false,
    },
    {
        title: "Build notification system",
        project: "Developer Project Tracker",
        priority: "Medium",
        due: "Tomorrow",
        completed: false,
    },
    {
        title: "Review API security rules",
        project: "API Security Audit",
        priority: "Low",
        due: "Oct 12",
        completed: true,
    },
    {
        title: "Create project settings",
        project: "Developer Portal",
        priority: "Medium",
        due: "Oct 14",
        completed: false,
    },
];

export default function MyTasks() {
    return (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        My tasks
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                        Work that needs your attention.
                    </p>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                    View all
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <div
                        key={task.title}
                        className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-800/50"
                    >
                        {task.completed ? (
                            <CircleCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                        ) : (
                            <Circle className="h-5 w-5 shrink-0 text-slate-600 group-hover:text-blue-400" />
                        )}

                        <div className="min-w-0 flex-1">
                            <p
                                className={`truncate text-xs font-medium ${task.completed
                                        ? "text-slate-600 line-through"
                                        : "text-slate-200"
                                    }`}
                            >
                                {task.title}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-600">
                                {task.project}
                            </p>
                        </div>

                        <div className="hidden shrink-0 items-center gap-3 sm:flex">
                            <span
                                className={`
                  rounded-md px-2 py-1 text-[9px] font-semibold
                  ${task.priority === "High"
                                        ? "bg-rose-500/10 text-rose-400"
                                        : task.priority === "Medium"
                                            ? "bg-amber-500/10 text-amber-400"
                                            : "bg-slate-800 text-slate-500"
                                    }
                `}
                            >
                                {task.priority}
                            </span>

                            <span className="flex items-center gap-1 text-[10px] text-slate-600">
                                <Clock3 className="h-3 w-3" />
                                {task.due}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}