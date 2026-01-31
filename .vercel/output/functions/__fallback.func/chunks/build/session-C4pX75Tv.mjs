import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { x as x$1, B, D, G } from '../nitro/nitro.mjs';
import { db as p$1 } from './index-BinUX9hy.mjs';
import { s as u } from './schema-DxiP6MVG.mjs';
import { eq } from 'drizzle-orm';
import 'solid-js/web';
import 'solid-js/web/storage';
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
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const t = "session", x = E(async function() {
  try {
    let e;
    try {
      e = x$1();
    } catch {
      return null;
    }
    const s = B(e, t);
    if (console.log(`[Session] getUser found cookie: ${s ? "YES" : "NO"} (${s})`), !s) return null;
    const o = await p$1.query.sessions.findFirst({ where: eq(u.id, s) });
    return o ? o.expiresAt < /* @__PURE__ */ new Date() ? (console.log("[Session] Session expired"), await f(), null) : o.userId : (console.log("[Session] Session not found in DB"), null);
  } catch (e) {
    return console.error("Error getting session cookie:", e), null;
  }
}, "src_lib_session_ts--getUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), I = E(async function(e) {
  console.log(`[Session] Creating session for user: ${e}`);
  try {
    const s = x$1(), o = crypto.randomUUID(), l = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30);
    await p$1.insert(u).values({ id: o, userId: e, expiresAt: l }), D(s, t, o, { httpOnly: true, secure: true, maxAge: 3600 * 24 * 30, path: "/", sameSite: "lax" }), console.log("[Session] Session created and cookie set");
  } catch (s) {
    throw console.error("Error creating session:", s), s;
  }
}, "src_lib_session_ts--createUserSession_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), p = E(async function() {
  console.log("Logging out user...");
  try {
    const e = x$1(), s = B(e, t);
    s && await p$1.delete(u).where(eq(u.id, s)), G(e, t, { path: "/" }), console.log("Session cookie deleted.");
  } catch (e) {
    console.error("Error during logout:", e);
  }
  return { success: true };
}, "src_lib_session_ts--logout_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), f = p;

export { I as createUserSession_1, x as getUser_1, p as logout_1 };
//# sourceMappingURL=session-C4pX75Tv.mjs.map
