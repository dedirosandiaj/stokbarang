import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { E } from './server-fns-runtime-DJML9_-T.mjs';
import { k } from '../nitro/nitro.mjs';
import { y } from './createAsync-CBz8AaaQ2.mjs';
import 'solid-js/web/storage';
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
import 'solid-js';
import 'rou3';
import 'srvx';

var n = ["<div", "><!--$-->", '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1><p class="text-slate-500 mt-2">Welcome back to your dashboard.</p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"><div class="text-sm font-medium text-slate-500 mb-4">Total Users</div><div class="text-3xl font-bold text-slate-900">1,234</div><div class="mt-2 text-sm text-emerald-600 font-medium">+12% <span class="text-slate-400 font-normal">from last month</span></div></div><div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"><div class="text-sm font-medium text-slate-500 mb-4">Active Sessions</div><div class="text-3xl font-bold text-slate-900">34</div><div class="mt-2 text-sm text-emerald-600 font-medium">+2% <span class="text-slate-400 font-normal">from yesterday</span></div></div><div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"><div class="text-sm font-medium text-slate-500 mb-4">User ID</div><div class="text-lg font-mono text-slate-900 truncate"', ">", '</div><div class="mt-2 text-sm text-slate-400">Current Session</div></div></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] p-8 flex items-center justify-center text-slate-400 border-dashed">Chart or Table Content Placeholder</div></div>'];
const m = E(async () => {
  const { getUser: t } = await import('./session-BHF4uoyM.mjs');
  return await t() || "Guest";
}, "src_routes_dashboard_index_tsx--getAuthenticatedUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/index.tsx?pick=default&pick=%24css&tsr-directive-use-server="), c = m;
function U() {
  const t = y(() => c());
  return ssr(n, ssrHydrationKey(), escape(createComponent(k, { children: "Dashboard | ElaApp" })), ssrAttribute("title", escape(t(), true) || "", false), escape(t()));
}

export { U as default };
//# sourceMappingURL=index5.mjs.map
