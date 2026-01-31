import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from './index-Dps0aSs2.mjs';
import 'solid-js';

var a = ["<div", "><!--$-->", '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1><p class="text-slate-500 mt-2">App configuration and preferences.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><p class="text-slate-500">Settings form will go here.</p></div></div>'];
function p() {
  return ssr(a, ssrHydrationKey(), escape(createComponent(k, { children: "Settings | ElaApp" })));
}

export { p as default };
//# sourceMappingURL=settings.mjs.map
