export default function DashboardLoading() {
    return (
        <div className="min-h-full bg-slate-950 p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] animate-pulse space-y-8">
                <div>
                    <div className="h-5 w-40 rounded bg-slate-900" />
                    <div className="mt-4 h-8 w-80 rounded bg-slate-900" />
                    <div className="mt-3 h-4 w-[500px] max-w-full rounded bg-slate-900" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-32 rounded-2xl border border-slate-800 bg-slate-900/50"
                        />
                    ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/50" />
                    <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/50" />
                </div>
            </div>
        </div>
    );
}