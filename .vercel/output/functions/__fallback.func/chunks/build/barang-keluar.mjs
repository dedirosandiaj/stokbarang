import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import 'solid-js';

var o = ["<div", "><!--$-->", '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Barang Keluar</h1><p class="text-slate-500 mt-2">Manage outgoing goods and shipments.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><p class="text-slate-500">Table for Outgoing Goods will go here.</p></div></div>'];
function n() {
  return ssr(o, ssrHydrationKey(), escape(createComponent(k, { children: "Barang Keluar | ElaApp" })));
}

export { n as default };
//# sourceMappingURL=barang-keluar.mjs.map
