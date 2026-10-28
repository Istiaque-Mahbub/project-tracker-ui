import {
    CheckSquare,
    FilePlus2,
    FolderPlus,
    UserPlus,
} from "lucide-react";

const actions = [
    {
        label: "New project",
        description: "Start a new workspace project",
        icon: FolderPlus,
    },
    {
        label: "Create task",
        description: "Add work to your backlog",
        icon: CheckSquare,
    },
    {
        label: "Invite member",
        description: "Add someone to your team",
        icon: UserPlus,
    },
    {
        label: "Add milestone",
        description: "Create a project milestone",
        icon: FilePlus2,
    },
];

export default function QuickActions() {
    return (
        <section>
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">
                    Quick actions
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                    Jump straight into your next action.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            type="button"
                            key={action.label}
                            className="
                group flex items-center gap-3 rounded-2xl
                border border-slate-800/80 bg-slate-900/40
                p-4 text-left transition
                hover:border-blue-500/20 hover:bg-blue-500/5
              "
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-200">
                                    {action.label}
                                </p>

                                <p className="mt-1 truncate text-[10px] text-slate-600">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}