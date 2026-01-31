import { createComponent, ssr, ssrHydrationKey, escape } from 'solid-js/web';
import { E as E$1 } from './server-fns-runtime-DJML9_-T.mjs';
import { Suspense, createEffect, Show, createSignal } from 'solid-js';
import { getUser as A$2 } from './session-BHF4uoyM.mjs';
import { a as s, U as Ue, c as De } from '../nitro/nitro.mjs';
import { A as A$1, y as y$2 } from './components-BfweKUze.mjs';
import { y as y$1 } from './createAsync-CBz8AaaQ2.mjs';
import 'solid-js/web/storage';
import './index-BinUX9hy2.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG2.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import 'vinxi/lib/invariant';
import 'vinxi/lib/path';
import 'node:url';
import 'seroval';
import 'seroval-plugins/web';

var y = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>'], $ = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>'], _ = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>'], B = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'], C = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'], j = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>'], A = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>'], I = ["<aside", ' class="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50"><div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm"><div class="font-bold text-xl text-white tracking-tight flex items-center gap-2"><div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">', '</div><span>Ela<span class="text-indigo-400">App</span></span></div></div><nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto"><div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div><!--$-->', '<!--/--></nav><div class="p-4 border-t border-slate-800 bg-slate-950/30"><button class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors duration-200 group"><span class="p-1.5 rounded-md transition-colors group-hover:bg-red-500/20">', "</span><span>Sign Out</span></button></div></aside>"], S = ["<div", ' class="', '">', "</div>"];
const l = () => ssr(y, ssrHydrationKey()), L = () => ssr($, ssrHydrationKey()), M = () => ssr(_, ssrHydrationKey()), R = () => ssr(B, ssrHydrationKey()), D = () => ssr(C, ssrHydrationKey()), U = () => ssr(j, ssrHydrationKey()), V = () => ssr(A, ssrHydrationKey());
function z(o) {
  const n = De(), a = [{ href: "/dashboard", label: "Dashboard", icon: l, exact: true }, { href: "/dashboard/produk", label: "Produk", icon: l }, { href: "/dashboard/barang-masuk", label: "Barang Masuk", icon: L }, { href: "/dashboard/barang-keluar", label: "Barang Keluar", icon: M }, { href: "/dashboard/bad-stock", label: "Bad Stock", icon: R }, { href: "/dashboard/users", label: "Kelola User", icon: D }, { href: "/dashboard/settings", label: "Settings", icon: U }];
  return ssr(I, ssrHydrationKey(), escape(createComponent(l, {})), escape(a.map((s) => {
    const c = () => s.exact ? n.pathname === s.href : n.pathname.startsWith(s.href);
    return createComponent(y$2, { get href() {
      return s.href;
    }, get class() {
      return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${c() ? "bg-indigo-600/10 text-indigo-400 font-medium" : "hover:bg-slate-800/50 hover:text-white"}`;
    }, get children() {
      return [ssr(S, ssrHydrationKey(), `p-1.5 rounded-md transition-colors ${c() ? "bg-indigo-600/20 text-indigo-400" : "group-hover:bg-slate-800 text-slate-400 group-hover:text-slate-300"}`, escape(createComponent(s.icon, {}))), s.label];
    } });
  })), escape(createComponent(V, {})));
}
var E = ["<div", ' class="fixed top-0 left-0 w-full h-1.5 z-[100] bg-indigo-100/50 backdrop-blur-sm pointer-events-none"><div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[progress_1s_ease-in-out_infinite] origin-left w-full shadow-lg shadow-indigo-500/50"></div></div>'], H = ["<style", `>
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(-20%); }
                    100% { transform: translateX(100%); }
                }
                </style>`];
function K() {
  const o = Ue(), [n, a] = createSignal(false);
  return createEffect(() => {
    if (o()) a(true);
    else {
      const s = setTimeout(() => {
        a(false);
      }, 500);
      return () => clearTimeout(s);
    }
  }), createComponent(Show, { get when() {
    return n();
  }, get children() {
    return [ssr(E, ssrHydrationKey()), ssr(H, ssrHydrationKey())];
  } });
}
var N = ["<div", ' class="flex flex-col items-center justify-center p-12 text-slate-400 gap-4"><div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div><p class="text-sm font-medium animate-pulse">Loading content...</p></div>'];
function P() {
  return ssr(N, ssrHydrationKey());
}
var T = ["<div", ' class="min-h-screen bg-slate-50 text-slate-900 flex font-sans"><!--$-->', "<!--/--><!--$-->", '<!--/--><div class="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300"><main class="flex-1 p-8"><div class="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">', "</div></main></div></div>"];
const X = E$1(async () => {
  const o = await A$2();
  return console.log("[Dashboard] protectRoute user:", o), o || false;
}, "src_routes_dashboard_tsx--protectRoute_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard.tsx?pick=default&pick=%24css&tsr-directive-use-server="), O = X;
function ue(o) {
  return createComponent(Suspense, { get fallback() {
    return createComponent(s, {});
  }, get children() {
    return createComponent(W, { get children() {
      return ssr(T, ssrHydrationKey(), escape(createComponent(K, {})), escape(createComponent(z, {})), escape(createComponent(Suspense, { get fallback() {
        return createComponent(P, {});
      }, get children() {
        return o.children;
      } })));
    } });
  } });
}
function W(o) {
  const n = y$1(() => O());
  return createEffect(() => {
    n();
  }), createComponent(Show, { get when() {
    return n() !== false && n() !== void 0;
  }, get fallback() {
    return createComponent(Show, { get when() {
      return n() === false;
    }, get children() {
      return createComponent(A$1, { href: "/auth/login" });
    } });
  }, get children() {
    return o.children;
  } });
}

export { ue as default };
//# sourceMappingURL=dashboard2.mjs.map
