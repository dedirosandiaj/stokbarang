import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { k } from '../nitro/nitro.mjs';
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
import 'solid-js/web/storage';
import 'rou3';
import 'srvx';

var s = ["<div", "><!--$-->", '<!--/--><div class="mb-8"><h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bad Stock</h1><p class="text-slate-500 mt-2">Manage damaged or returned goods.</p></div><div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"><p class="text-slate-500">Bad Stock management table will go here.</p></div></div>'];
function c() {
  return ssr(s, ssrHydrationKey(), escape(createComponent(k, { children: "Bad Stock | ElaApp" })));
}

export { c as default };
//# sourceMappingURL=bad-stock2.mjs.map
