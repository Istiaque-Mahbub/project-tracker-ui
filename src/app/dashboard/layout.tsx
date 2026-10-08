"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardTopbar from "@/components/dashboard/dashboard-topbar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <DashboardSidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggle={() => setCollapsed((value) => !value)}
                onMobileClose={() => setMobileOpen(false)}
            />

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