import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { getUser as A } from './session-D_Gl5yQj.mjs';
import 'solid-js/web';
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
import './index-BinUX9hy.mjs';
import 'drizzle-orm/postgres-js';
import 'postgres';
import './schema-DxiP6MVG.mjs';
import 'drizzle-orm/pg-core';
import 'drizzle-orm';

const S = E(async function() {
  console.log("Checking session (Server Action)...");
  try {
    const r = await A();
    return console.log("User ID from session:", r), r ? (console.log("Redirecting to dashboard"), "/dashboard") : (console.log("Redirecting to login"), "/auth/login");
  } catch (r) {
    return console.error("Error in checkSession:", r), "/auth/login";
  }
}, "src_lib_auth-checks_ts--checkSession_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/auth-checks.ts?tsr-directive-use-server=");

export { S as checkSession_1 };
//# sourceMappingURL=auth-checks-BwLvXVBd.mjs.map
