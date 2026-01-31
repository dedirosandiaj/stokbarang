import { createAsync } from "@solidjs/router";
import { Title } from "@solidjs/meta";

const getAuthenticatedUser = async () => {
    "use server";
    const { getUser } = await import("~/lib/session");
    const userId = await getUser();
    // Redirect handled by middleware/protected route logic usually, but here for safety
    if (!userId) {
        // throw redirect("/auth/login"); // handled elsewhere? 
    }
    return userId || "Guest";
};

export default function DashboardIndex() {
    const user = createAsync(() => getAuthenticatedUser());

    return (
        <div>
            <Title>Dashboard | ElaApp</Title>
            {/* Header */}
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                <p class="text-slate-500 mt-2">Welcome back to your dashboard.</p>
            </div>

            {/* Stats Grid */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div class="text-sm font-medium text-slate-500 mb-4">Total Users</div>
                    <div class="text-3xl font-bold text-slate-900">1,234</div>
                    <div class="mt-2 text-sm text-emerald-600 font-medium">+12% <span class="text-slate-400 font-normal">from last month</span></div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div class="text-sm font-medium text-slate-500 mb-4">Active Sessions</div>
                    <div class="text-3xl font-bold text-slate-900">34</div>
                    <div class="mt-2 text-sm text-emerald-600 font-medium">+2% <span class="text-slate-400 font-normal">from yesterday</span></div>
                </div>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div class="text-sm font-medium text-slate-500 mb-4">User ID</div>
                    <div class="text-lg font-mono text-slate-900 truncate" title={user() || ""}>{user()}</div>
                    <div class="mt-2 text-sm text-slate-400">Current Session</div>
                </div>
            </div>

            {/* Content Area */}
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] p-8 flex items-center justify-center text-slate-400 border-dashed">
                Chart or Table Content Placeholder
            </div>
        </div>
    );
}
