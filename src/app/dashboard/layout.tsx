"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardTopbar from "@/components/dashboard/dashboard-topbar";
import { isAuthenticated, syncAuthCookie } from "@/lib/auth";

function SidebarFallback({ collapsed }: { collapsed: boolean }) {
    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 flex flex-col
                border-r border-slate-800/80 bg-slate-950
                lg:sticky lg:top-0 lg:h-screen lg:shrink-0
                ${collapsed ? "lg:w-[76px]" : "lg:w-[250px]"}
                w-[270px] -translate-x-full lg:translate-x-0
            `}
        >
            <div className="flex h-20 items-center border-b border-slate-800/80 px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20" />
            </div>
            <div className="flex-1 space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-slate-900/40 animate-pulse" />
                ))}
            </div>
        </aside>
    );
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/");
        } else {
            syncAuthCookie();
        }
    }, [router]);

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <Suspense fallback={<SidebarFallback collapsed={collapsed} />}>
                <DashboardSidebar
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    onToggle={() => setCollapsed((value) => !value)}
                    onMobileClose={() => setMobileOpen(false)}
                />
            </Suspense>

            <div className="flex min-w-0 flex-1 flex-col">
                <DashboardTopbar
                    onMenuClick={() => setMobileOpen(true)}
                />

                <main className="min-w-0 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}