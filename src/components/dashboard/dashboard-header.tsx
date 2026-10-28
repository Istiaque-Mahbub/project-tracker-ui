import { ArrowUpRight, Plus, Sparkles } from "lucide-react";

export default function DashboardHeader() {
    return (
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/10 bg-blue-500/5 px-3 py-1.5 text-[11px] font-medium text-blue-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Developer Command Center
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Good afternoon, Developer 👋
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Here's what is happening across your projects today.
                    Keep the important work moving forward.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="
            inline-flex items-center gap-2 rounded-xl
            border border-slate-800 bg-slate-900
            px-4 py-2.5 text-xs font-semibold text-slate-300
            transition hover:border-slate-700 hover:bg-slate-800
          "
                >
                    View activity
                    <ArrowUpRight className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    className="
            inline-flex items-center gap-2 rounded-xl
            bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white
            shadow-lg shadow-blue-600/20 transition
            hover:bg-blue-500
          "
                >
                    <Plus className="h-4 w-4" />
                    New project
                </button>
            </div>
        </div>
    );
}