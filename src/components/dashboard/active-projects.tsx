import { ArrowUpRight, MoreHorizontal } from "lucide-react";

const projects = [
    {
        name: "Developer Project Tracker",
        description: "Project management platform",
        progress: 78,
        tasks: "24 / 31",
    },
    {
        name: "API Security Audit",
        description: "Automated API security scanner",
        progress: 54,
        tasks: "16 / 29",
    },
    {
        name: "Developer Portal",
        description: "Internal developer workspace",
        progress: 32,
        tasks: "8 / 25",
    },
];

export default function ActiveProjects() {
    return (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        Active projects
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                        Your team's current work.
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

            <div className="space-y-5">
                {projects.map((project) => (
                    <div key={project.name}>
                        <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-200">
                                    {project.name}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-slate-600">
                                    {project.description}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="shrink-0 rounded-lg p-1 text-slate-600 hover:bg-slate-800 hover:text-slate-300"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>

                            <span className="w-8 text-right text-[10px] font-semibold text-slate-500">
                                {project.progress}%
                            </span>
                        </div>

                        <p className="mt-2 text-[10px] text-slate-600">
                            {project.tasks} tasks completed
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}