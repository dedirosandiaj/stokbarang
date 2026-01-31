import { A, useLocation, useNavigate } from "@solidjs/router";
import { logout } from "~/lib/session";
import { Show } from "solid-js";

// Icons
const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
)

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
)

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
)

const AlertCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
)


type SidebarProps = {};

export default function Sidebar(props: SidebarProps) {
    const location = useLocation();
    const handleLogout = async () => {
        await logout();
        // Force a hard reload to ensure all states are cleared
        window.location.href = "/auth/login";
    };

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: BoxIcon, exact: true },
        { href: "/dashboard/produk", label: "Produk", icon: BoxIcon },
        { href: "/dashboard/barang-masuk", label: "Barang Masuk", icon: ArrowDownIcon },
        { href: "/dashboard/barang-keluar", label: "Barang Keluar", icon: ArrowUpIcon },
        { href: "/dashboard/bad-stock", label: "Bad Stock", icon: AlertCircleIcon },
        { href: "/dashboard/users", label: "Kelola User", icon: UsersIcon },
        { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ];

    return (
        <aside class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50">
            {/* Brand */}
            <div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
                <div class="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <BoxIcon />
                    </div>
                    <span>Ela<span class="text-indigo-400">App</span></span>
                </div>
            </div>

            {/* Navigation */}
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
                {links.map((link) => {
                    const isActive = () => {
                        if (link.exact) return location.pathname === link.href;
                        return location.pathname.startsWith(link.href);
                    };

                    return (
                        <A
                            href={link.href}
                            // end={link.exact} // We handle styling manually now
                            class={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive()
                                    ? "bg-indigo-600/10 text-indigo-400 font-medium"
                                    : "hover:bg-slate-800/50 hover:text-white"
                                }`}
                        >
                            <div class={`p-1.5 rounded-md transition-colors ${isActive()
                                    ? "bg-indigo-600/20 text-indigo-400"
                                    : "group-hover:bg-slate-800 text-slate-400 group-hover:text-slate-300"
                                }`}>
                                <link.icon />
                            </div>
                            {link.label}
                        </A>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div class="p-4 border-t border-slate-800 bg-slate-950/30">
                <button onClick={handleLogout} class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors duration-200 group">
                    <span class="p-1.5 rounded-md transition-colors group-hover:bg-red-500/20">
                        <LogoutIcon />
                    </span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
