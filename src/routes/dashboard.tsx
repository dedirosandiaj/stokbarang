import { RouteSectionProps, createAsync, Navigate } from "@solidjs/router";
import { Show, createEffect, Suspense } from "solid-js";
import Sidebar from "~/components/Sidebar";
import { getUser } from "~/lib/session";
import Loading from "~/components/Loading";
import NavigationLoader from "~/components/NavigationLoader";
import ContentLoader from "~/components/ContentLoader";

const protectRoute = async () => {
    "use server";
    const sessionUser = await getUser();
    console.log("[Dashboard] protectRoute user:", sessionUser);
    // Return explicit false if no user, to differentiate from "not loaded yet" (undefined)
    return sessionUser || false;
};

export default function DashboardLayout(props: RouteSectionProps) {
    // We use a Resource or createAsync for auth. 
    // To prevent the entire layout from suspending (and hiding the Sidebar) when CHILDREN suspend,
    // we should place the Suspense boundary for children INSIDE the layout.
    // However, we also need to wait for Auth before showing anything.

    // Strategy:
    // 1. Outer Suspense + Auth Check (Full screen load for initial entry)
    // 2. Inner Layout (Sidebar + Content Container)
    // 3. Inner Suspense (Content only loading)

    return (
        <Suspense fallback={<Loading />}>
            <DashboardProtectedWrapper>
                <div class="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
                    <NavigationLoader />
                    <Sidebar />

                    {/* Main Content Area */}
                    <div class="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                        <main class="flex-1 p-8">
                            <div class="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* This Suspense only handles nested route data fetching */}
                                <Suspense fallback={<ContentLoader />}>
                                    {props.children}
                                </Suspense>
                            </div>
                        </main>
                    </div>
                </div>
            </DashboardProtectedWrapper>
        </Suspense>
    );
}

function DashboardProtectedWrapper(props: { children: any }) {
    const user = createAsync(() => protectRoute());

    createEffect(() => {
        if (user() === false) {
            // We can use Navigate logic here or in the render
        }
    });

    return (
        <Show
            when={user() !== false && user() !== undefined}
            fallback={
                <Show when={user() === false}>
                    <Navigate href="/auth/login" />
                </Show>
            }
        >
            {props.children}
        </Show>
    );
}
