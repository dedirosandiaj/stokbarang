import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import 'solid-js';

var s = ["<div", "><!--$-->", '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bad Stock</h1><p class="text-slate-500 mt-2">Manage damaged or returned goods.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><p class="text-slate-500">Bad Stock management table will go here.</p></div></div>'];
function c() {
  return ssr(s, ssrHydrationKey(), escape(createComponent(k, { children: "Bad Stock | ElaApp" })));
}

export { c as default };
//# sourceMappingURL=bad-stock.mjs.map
