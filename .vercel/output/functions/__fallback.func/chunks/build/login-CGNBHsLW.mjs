import { E as E$1 } from './server-fns-runtime-HUGH5Jm0.mjs';
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
import 'rou3';
import 'srvx';

const E = E$1(async (e) => {
  const { db: i } = await import('./index-BinUX9hy.mjs'), { users: n } = await import('./schema-DxiP6MVG.mjs').then((s) => s.a), { eq: a } = await import('drizzle-orm'), c = await import('bcryptjs'), { getEvent: m, setCookie: u } = await import('../nitro/nitro.mjs').then(function (n) { return n.h; }).then((s) => s.h), r = String(e.get("username")), p = String(e.get("password"));
  console.log(`Attempting login for: ${r}`);
  const o = await i.query.users.findFirst({ where: a(n.username, r) });
  if (!o) throw console.log("User not found"), new Error("Invalid username or password");
  const t = await c.compare(p, o.password);
  if (console.log(`Password valid: ${t}`), !t) throw console.log("Invalid password"), new Error("Invalid username or password");
  const { createUserSession: l } = await import('./session-D_Gl5yQj.mjs');
  return console.log("Creating session..."), await l(o.id), console.log("[Login] Session created. Returning success for client-side redirect."), { success: true };
}, "src_routes_auth_login_tsx--login_action", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/auth/login.tsx?pick=default&pick=%24css&tsr-directive-use-server=");

export { E as login_action };
//# sourceMappingURL=login-CGNBHsLW.mjs.map
