"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    Bell,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    LayoutDashboard,
    Milestone,
    Settings,
    Users,
    X,
    Zap,
} from "lucide-react";

interface DashboardSidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
}

const workspaceItems = [
    {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Projects",
        href: "/dashboard/projects",
        icon: FolderKanban,
    },
    {
        label: "Tasks",
        href: "/dashboard/tasks",
        icon: CheckSquare,
    },
    {
        label: "Milestones",
        href: "/dashboard/milestones",
        icon: Milestone,
    },
    {
        label: "Team",
        href: "/dashboard/team",
        icon: Users,
    },
];

const activityItems = [
    {
        label: "Activity",
        href: "/dashboard/activity",
        icon: Activity,
    },
    {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
    },
];

export default function DashboardSidebar({
    collapsed,
    mobileOpen,
    onToggle,
    onMobileClose,
}: DashboardSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href;
        }

        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onMobileClose}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-800/80 bg-slate-950
          transition-all duration-300
          lg:sticky lg:top-0 lg:h-screen lg:shrink-0
          ${collapsed ? "lg:w-[76px]" : "lg:w-[250px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-[270px]
        `}
            >
                {/* Logo */}
                <div className="flex h-20 items-center border-b border-slate-800/80 px-5">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold tracking-wide text-white">
                                    DEVTRACK
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                    Developer Command Center
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-6">
                    {!collapsed && (
                        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            Workspace
                        </p>
                    )}

                    <div className="space-y-1">
                        {workspaceItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    title={collapsed ? item.label : undefined}
                                    className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm transition-all
                    ${active
                                            ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/10"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        }
                    ${collapsed ? "justify-center" : ""}
                  `}
                                >
                                    <Icon
                                        className={`
                      h-[18px] w-[18px] shrink-0
                      ${active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}
                    `}
                                    />

                                    {!collapsed && <span>{item.label}</span>}

                                    {active && !collapsed && (
                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {!collapsed && (
                        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            Workspace Activity
                        </p>
                    )}

                    <div className="space-y-1">
                        {activityItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onMobileClose}
                                    title={collapsed ? item.label : undefined}
                                    className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm transition-all
                    ${active
                                            ? "bg-blue-600/10 text-blue-400"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        }
                    ${collapsed ? "justify-center" : ""}
                  `}
                                >
                                    <Icon className="h-[18px] w-[18px] shrink-0" />

                                    {!collapsed && <span>{item.label}</span>}

                                    {item.label === "Notifications" && !collapsed && (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                                            3
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom section */}
                <div className="border-t border-slate-800/80 p-3">
                    <Link
                        href="/dashboard/settings"
                        onClick={onMobileClose}
                        title={collapsed ? "Settings" : undefined}
                        className={`
              flex items-center gap-3 rounded-xl px-3 py-2.5
              text-sm text-slate-400 transition
              hover:bg-slate-900 hover:text-white
              ${collapsed ? "justify-center" : ""}
            `}
                    >
                        <Settings className="h-[18px] w-[18px] shrink-0" />

                        {!collapsed && <span>Settings</span>}
                    </Link>


                </div>

                {/* Collapse button */}
                <button
                    type="button"
                    onClick={onToggle}
                    className="
            absolute -right-3 top-24 hidden h-7 w-7
            items-center justify-center rounded-full
            border border-slate-700 bg-slate-900
            text-slate-400 shadow-lg
            transition hover:text-white
            lg:flex
          "
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </aside>
        </>
    );
}