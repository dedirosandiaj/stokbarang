import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import { createSignal, Show } from 'solid-js';
import { y as y$1, h } from './users-BYnp0MmX.mjs';
import { S } from './UserForm-B0Y6JnWz.mjs';
import { z as ze, M as Me } from './routing-CMRlbYJP.mjs';
import { y } from './createAsync-CBz8AaaQ.mjs';
import './server-fns-runtime-HUGH5Jm0.mjs';
import 'solid-js/web/storage';
import '../nitro/nitro.mjs';
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
import './index-BinUX9hy.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import 'bcryptjs';
import './Button-BuAho1tZ.mjs';
import 'zod';

var $ = ["<div", ' class="max-w-5xl mx-auto"><!--$-->', '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Edit User</h1><p class="text-slate-500 mt-2">Update user account details.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></div>"], E = ["<div", ' class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">', "</div>"], A = ["<div", ' class="py-8 text-center text-slate-500">Loading user data...</div>'];
function V() {
  const m = ze(), c = Me(), u = y(() => h(m.id)), [g, d] = createSignal(false), [p, r] = createSignal(""), b = async (t) => {
    d(true), r("");
    try {
      const e = { username: t.username, role: t.role };
      t.password && (e.password = t.password);
      const n = await y$1(m.id, e);
      n.success ? c("/dashboard/users") : r(n.error || "Failed to update user");
    } catch {
      r("An unexpected error occurred");
    } finally {
      d(false);
    }
  };
  return ssr($, ssrHydrationKey(), escape(createComponent(k, { children: "Edit User | ElaApp" })), p() && ssr(E, ssrHydrationKey(), escape(p())), escape(createComponent(Show, { get when() {
    return u();
  }, get fallback() {
    return ssr(A, ssrHydrationKey());
  }, children: (t) => createComponent(S, { initialData: t, onSubmit: b, get isSubmitting() {
    return g();
  } }) })));
}

export { V as default };
//# sourceMappingURL=_id_.mjs.map
