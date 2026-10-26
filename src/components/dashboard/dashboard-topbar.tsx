"use client";

import {
    Bell,
    Building2,
    ChevronDown,
    Menu,
} from "lucide-react";

interface DashboardTopbarProps {
    onMenuClick: () => void;
}

export default function DashboardTopbar({
    onMenuClick,
}: DashboardTopbarProps) {
    return (
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Workspace switcher */}
                <button
                    type="button"
                    className="
            hidden items-center gap-3 rounded-xl border border-slate-800
            bg-slate-900/60 px-3 py-2 text-left
            transition hover:border-slate-700 sm:flex
          "
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Workspace
                        </p>
                        <p className="text-xs font-semibold text-slate-200">
                            Developer Team
                        </p>
                    </div>

                    <ChevronDown className="ml-2 h-4 w-4 text-slate-600" />
                </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">


                {/* Notifications */}
                <button
                    type="button"
                    className="relative rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                    <Bell className="h-5 w-5" />

                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
                </button>


            </div>
        </header>
    );
}