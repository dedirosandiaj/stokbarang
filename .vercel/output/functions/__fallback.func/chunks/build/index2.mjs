import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import { Show, For } from 'solid-js';
import { g as g$1 } from './products-BWm0EwFZ.mjs';
import { y as y$2 } from './components-2Zj0uUoj.mjs';
import { y as y$1 } from './createAsync-CBz8AaaQ.mjs';
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
import 'rou3';
import 'srvx';
import './index-BinUX9hy.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';
import './routing-CMRlbYJP.mjs';

var h = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'], x = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'], g = ["<svg", ' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'], m = ["<div", "><!--$-->", '<!--/--><div class="flex items-center justify-between mb-8"><div><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Produk</h1><p class="text-slate-500 mt-2">Manage your product inventory.</p></div><!--$-->', '<!--/--></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-left text-sm text-slate-600"><thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500"><tr><th class="px-6 py-4">Brand</th><th class="px-6 py-4">Kode Barang</th><th class="px-6 py-4">Nama Barang</th><th class="px-6 py-4">Gramasi</th><th class="px-6 py-4">Satuan</th><th class="px-6 py-4 text-right">Harga</th><th class="px-6 py-4 text-center">Stok</th><th class="px-6 py-4 text-center">Actions</th></tr></thead><tbody class="divide-y divide-slate-200">', "</tbody></table></div></div></div>"], u = ["<tr", '><td colspan="8" class="px-6 py-12 text-center text-slate-400">No products found. Add your first one!</td></tr>'], y = ["<tr", ' class="hover:bg-slate-50 transition-colors"><td class="px-6 py-4 font-medium text-slate-900 capitalize">', '</td><td class="px-6 py-4 font-mono text-xs bg-slate-100 rounded-md py-1 px-2 w-fit">', '</td><td class="px-6 py-4">', '</td><td class="px-6 py-4">', '</td><td class="px-6 py-4">', '</td><td class="px-6 py-4 text-right font-medium">Rp <!--$-->', '<!--/--></td><td class="px-6 py-4 text-center"><span class="', '">', '</span></td><td class="px-6 py-4 text-center"><div class="flex items-center justify-center gap-2"><!--$-->', '<!--/--><button class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Delete">', "</button></div></td></tr>"];
const v = () => ssr(h, ssrHydrationKey()), f = () => ssr(x, ssrHydrationKey());
function K() {
  console.log("[ProdukIndex] Component mounting...");
  const n = y$1(async () => {
    console.log("[ProdukIndex] Fetching products...");
    try {
      const t = await g$1();
      return console.log("[ProdukIndex] Products fetched:", t == null ? void 0 : t.length), t;
    } catch (t) {
      throw console.error("[ProdukIndex] Error fetching products:", t), t;
    }
  });
  return ssr(m, ssrHydrationKey(), escape(createComponent(k, { children: "Produk | ElaApp" })), escape(createComponent(y$2, { href: "/dashboard/produk/create", class: "bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2", get children() {
    return [ssr(g, ssrHydrationKey()), "Add Product"];
  } })), escape(createComponent(Show, { get when() {
    return n() && n().length > 0;
  }, get fallback() {
    return ssr(u, ssrHydrationKey());
  }, get children() {
    return createComponent(For, { get each() {
      return n();
    }, children: (t) => ssr(y, ssrHydrationKey(), escape(t.brand), escape(t.kodeBarang), escape(t.namaBarang), escape(t.gramasi) || "-", escape(t.satuan) || "-", escape(t.harga.toLocaleString()), `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.stok > 10 ? "bg-emerald-100 text-emerald-800" : t.stok > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`, escape(t.stok), escape(createComponent(y$2, { get href() {
      return `/dashboard/produk/${t.id}/edit`;
    }, class: "p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors", title: "Edit", get children() {
      return createComponent(v, {});
    } })), escape(createComponent(f, {}))) });
  } })));
}

export { K as default };
//# sourceMappingURL=index2.mjs.map
