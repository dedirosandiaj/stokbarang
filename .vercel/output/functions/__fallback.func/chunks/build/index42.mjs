import { createComponent, ssr, ssrHydrationKey } from 'solid-js/web';
import { E } from './server-fns-runtime-DJML9_-T.mjs';
import { getUser as A$1 } from './session-BHF4uoyM.mjs';
import { y } from './createAsync-CBz8AaaQ2.mjs';
import { A } from './components-BfweKUze.mjs';
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
import 'solid-js';
import 'rou3';
import 'srvx';
import './index-BinUX9hy2.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG2.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

const a = E(async function() {
  console.log("Checking session (Server Action)...");
  try {
    const r = await A$1();
    return console.log("User ID from session:", r), r ? (console.log("Redirecting to dashboard"), "/dashboard") : (console.log("Redirecting to login"), "/auth/login");
  } catch (r) {
    return console.error("Error in checkSession:", r), "/auth/login";
  }
}, "src_lib_auth-checks_ts--checkSession_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/auth-checks.ts?tsr-directive-use-server="), p = a;
var l = ["<div", ">Loading...</div>"];
function I() {
  const r = y(() => p())();
  return r ? createComponent(A, { href: r }) : ssr(l, ssrHydrationKey());
}

export { I as default };
//# sourceMappingURL=index42.mjs.map
