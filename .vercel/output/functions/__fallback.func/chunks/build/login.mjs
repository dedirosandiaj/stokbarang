import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { createEffect } from 'solid-js';
import { s } from './Loading-b-bAnbUN.mjs';
import { t as te, r as re } from './action-CnXm9LBs.mjs';
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
import './routing-CMRlbYJP.mjs';

var S = ["<div", ' class="flex items-center justify-center min-h-screen bg-gray-100"><!--$-->', '<!--/--><div class="p-8 bg-white rounded shadow-md w-96 relative"><h1 class="mb-6 text-2xl font-bold text-center">Login</h1><form', ' method="post" class="flex flex-col gap-4"><div><label class="block mb-2 text-sm font-bold text-gray-700">Username</label><input type="text" name="username" class="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" required></div><div><label class="block mb-2 text-sm font-bold text-gray-700">Password</label><input type="password" name="password" class="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" required></div><!--$-->', '<!--/--><button type="submit"', ' class="', '">', "</button></form></div></div>"], _ = ["<div", ' class="text-red-500 text-sm font-bold text-center">', "</div>"];
const $ = E(async (e) => {
  const { db: d } = await import('./index-BinUX9hy.mjs'), { users: u } = await import('./schema-DxiP6MVG.mjs').then((s) => s.a), { eq: p } = await import('drizzle-orm'), m = await import('bcryptjs'), { getEvent: L, setCookie: k } = await import('../nitro/nitro.mjs').then(function (n) { return n.h; }).then((s) => s.h), r = String(e.get("username")), g = String(e.get("password"));
  console.log(`Attempting login for: ${r}`);
  const o = await d.query.users.findFirst({ where: p(u.username, r) });
  if (!o) throw console.log("User not found"), new Error("Invalid username or password");
  const n = await m.compare(g, o.password);
  if (console.log(`Password valid: ${n}`), !n) throw console.log("Invalid password"), new Error("Invalid username or password");
  const { createUserSession: f } = await import('./session-D_Gl5yQj.mjs');
  return console.log("Creating session..."), await f(o.id), console.log("[Login] Session created. Returning success for client-side redirect."), { success: true };
}, "src_routes_auth_login_tsx--login_action", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/auth/login.tsx?pick=default&pick=%24css&tsr-directive-use-server="), c = re($);
function J() {
  const e = te(c);
  return createEffect(() => {
    var _a;
    ((_a = e.result) == null ? void 0 : _a.success) && (console.log("Login successful, performing full page navigation..."), window.location.href = "/dashboard");
  }), ssr(S, ssrHydrationKey(), e.pending && escape(createComponent(s, {})), ssrAttribute("action", escape(c, true), false), e.error && ssr(_, ssrHydrationKey(), escape(e.error.message)), ssrAttribute("disabled", e.pending, true), `px-4 py-2 font-bold text-white rounded focus:outline-none focus:shadow-outline ${e.pending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}`, e.pending ? "Signing In..." : "Sign In");
}

export { J as default };
//# sourceMappingURL=login.mjs.map
