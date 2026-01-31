import { E } from './server-fns-runtime-DJML9_-T.mjs';
import { d as x, e as B, f as G, g as D } from '../nitro/nitro.mjs';
import { db as p$1 } from './index-BinUX9hy2.mjs';
import { s as u } from './schema-DxiP6MVG2.mjs';
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
import 'rou3';
import 'srvx';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const t = "session", p = E(async function() {
  try {
    let e;
    try {
      e = x();
    } catch {
      return null;
    }
    const s = B(e, t);
    if (console.log(`[Session] getUser found cookie: ${s ? "YES" : "NO"} (${s})`), !s) return null;
    const o = await p$1.query.sessions.findFirst({ where: eq(u.id, s) });
    return o ? o.expiresAt < /* @__PURE__ */ new Date() ? (console.log("[Session] Session expired"), await _(), null) : o.userId : (console.log("[Session] Session not found in DB"), null);
  } catch (e) {
    return console.error("Error getting session cookie:", e), null;
  }
}, "src_lib_session_ts--getUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), A = p, S = E(async function(e) {
  console.log(`[Session] Creating session for user: ${e}`);
  try {
    const s = x(), o = crypto.randomUUID(), l = new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30);
    await p$1.insert(u).values({ id: o, userId: e, expiresAt: l }), D(s, t, o, { httpOnly: true, secure: true, maxAge: 3600 * 24 * 30, path: "/", sameSite: "lax" }), console.log("[Session] Session created and cookie set");
  } catch (s) {
    throw console.error("Error creating session:", s), s;
  }
}, "src_lib_session_ts--createUserSession_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), R = S, f = E(async function() {
  console.log("Logging out user...");
  try {
    const e = x(), s = B(e, t);
    s && await p$1.delete(u).where(eq(u.id, s)), G(e, t, { path: "/" }), console.log("Session cookie deleted.");
  } catch (e) {
    console.error("Error during logout:", e);
  }
  return { success: true };
}, "src_lib_session_ts--logout_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/session.ts?tsr-directive-use-server="), _ = f;

export { R as createUserSession, A as getUser, _ as logout };
//# sourceMappingURL=session-BHF4uoyM.mjs.map
