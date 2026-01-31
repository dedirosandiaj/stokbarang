import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import { createSignal } from 'solid-js';
import { b } from './products-BWm0EwFZ.mjs';
import { R } from './ProductForm-CMxez_KK.mjs';
import { M as Me } from './routing-CMRlbYJP.mjs';
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
import './Button-BuAho1tZ.mjs';
import 'zod';

var v = ["<div", ' class="max-w-5xl mx-auto"><!--$-->', '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Add Product</h1><p class="text-slate-500 mt-2">Add a new item to your inventory.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></div>"], x = ["<div", ' class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">', "</div>"];
function B() {
  const c = Me(), [p, e] = createSignal(false), [i, t] = createSignal(""), n = async (l) => {
    e(true), t("");
    try {
      const r = await b(l);
      r.success ? c("/dashboard/produk") : t(r.error || "Failed to create product");
    } catch {
      t("An unexpected error occurred");
    } finally {
      e(false);
    }
  };
  return ssr(v, ssrHydrationKey(), escape(createComponent(k, { children: "Add Product | ElaApp" })), i() && ssr(x, ssrHydrationKey(), escape(i())), escape(createComponent(R, { onSubmit: n, get isSubmitting() {
    return p();
  } })));
}

export { B as default };
//# sourceMappingURL=create.mjs.map
