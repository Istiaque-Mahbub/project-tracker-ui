"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getAuth } from "@/lib/auth";

export default function DashboardPage() {
    const router = useRouter();

    const [tenantId, setTenantId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const auth = getAuth();

        if (!auth) {
            router.replace("/login");
            return;
        }

        // Use the first tenant returned by the login response.
        const firstTenantId = auth.tenants?.[0]?.id ?? null;

        if (!firstTenantId) {
            setTenantId(null);
            setIsInitializing(false);
            return;
        }

        setTenantId(firstTenantId);
        setIsInitializing(false);
    }, [router]);

    if (isInitializing) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
                <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    <span>Loading your workspace...</span>
                </div>
            </main>
        );
    }

    if (!tenantId) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
                <div className="max-w-md rounded-2xl border border-amber-500/20 bg-slate-900/80 p-8 text-center shadow-xl shadow-black/30 backdrop-blur-xl">
                    <h1 className="text-lg font-semibold text-white">
                        No workspace available
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        You are logged in, but your account does not have
                        a tenant assigned. Create a tenant or ask an
                        administrator to add you to a workspace.
                    </p>
                </div>
            </main>
        );
    }

    return <DashboardContent tenantId={tenantId} />;
}
