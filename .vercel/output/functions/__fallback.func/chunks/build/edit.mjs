import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import { createSignal, Show } from 'solid-js';
import { w, v } from './products-BWm0EwFZ.mjs';
import { R as R$1 } from './ProductForm-CMxez_KK.mjs';
import { s } from './Loading-b-bAnbUN.mjs';
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
import './Button-BuAho1tZ.mjs';
import 'zod';

var E = ["<div", ' class="max-w-5xl mx-auto"><!--$-->', '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Edit Product</h1><p class="text-slate-500 mt-2">Update product information.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><!--$-->', "<!--/--><!--$-->", "<!--/--></div></div>"], $ = ["<div", ' class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">', "</div>"];
function R() {
  const o = ze(), c = Me(), s$1 = y(() => v(o.id)), [u, e] = createSignal(false), [d, t] = createSignal(""), l = async (f) => {
    if (e(true), t(""), !o.id) {
      t("Invalid product ID"), e(false);
      return;
    }
    try {
      const i = await w(o.id, f);
      i.success ? c("/dashboard/produk") : t(i.error || "Failed to update product");
    } catch {
      t("An unexpected error occurred");
    } finally {
      e(false);
    }
  };
  return ssr(E, ssrHydrationKey(), escape(createComponent(k, { children: "Edit Product | ElaApp" })), d() && ssr($, ssrHydrationKey(), escape(d())), escape(createComponent(Show, { get when() {
    return s$1();
  }, get fallback() {
    return createComponent(s, {});
  }, get children() {
    return createComponent(R$1, { get initialData() {
      return s$1();
    }, onSubmit: l, get isSubmitting() {
      return u();
    } });
  } })));
}

export { R as default };
//# sourceMappingURL=edit.mjs.map
