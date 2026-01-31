import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { M as Me, k } from '../nitro/nitro.mjs';
import { createSignal } from 'solid-js';
import { v as v$1 } from './users-DiCcX9od.mjs';
import { S } from './UserForm-B0Y6JnWz2.mjs';
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
import 'solid-js/web/storage';
import './server-fns-runtime-DJML9_-T.mjs';
import './index-BinUX9hy2.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG2.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import 'bcryptjs';
import './Button-BuAho1tZ2.mjs';
import 'zod';

var x = ["<div", ' class="max-w-5xl mx-auto"><!--$-->', '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Add User</h1><p class="text-slate-500 mt-2">Create a new user account.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></div>"], v = ["<div", ' class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">', "</div>"];
function D() {
  const p = Me(), [c, o] = createSignal(false), [s, r] = createSignal(""), n = async (l) => {
    o(true), r("");
    try {
      const t = await v$1(l);
      t.success ? p("/dashboard/users") : r(t.error || "Failed to create user");
    } catch {
      r("An unexpected error occurred");
    } finally {
      o(false);
    }
  };
  return ssr(x, ssrHydrationKey(), escape(createComponent(k, { children: "Add User | ElaApp" })), s() && ssr(v, ssrHydrationKey(), escape(s())), escape(createComponent(S, { onSubmit: n, get isSubmitting() {
    return c();
  } })));
}

export { D as default };
//# sourceMappingURL=create22.mjs.map
