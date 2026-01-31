import { E as E$1 } from './server-fns-runtime-HUGH5Jm0.mjs';
import { db as p } from './index-BinUX9hy.mjs';
import { u as n } from './schema-DxiP6MVG.mjs';
import { desc, eq } from 'drizzle-orm';
import i from 'bcryptjs';
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
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const C = E$1(async function() {
  return await p.select().from(n).orderBy(desc(n.createdAt));
}, "src_lib_users_ts--getUsers_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), P = E$1(async function(e) {
  return (await p.select().from(n).where(eq(n.id, e)))[0];
}, "src_lib_users_ts--getUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), R = E$1(async function(e) {
  try {
    const s = await i.hash(e.password, 10);
    return await p.insert(n).values({ ...e, password: s }), { success: true };
  } catch (s) {
    return console.error("Create user error:", s), { success: false, error: "Failed to create user" };
  }
}, "src_lib_users_ts--createUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), E = E$1(async function(e, s) {
  try {
    const t = { ...s };
    return t.password && (t.password = await i.hash(t.password, 10)), await p.update(n).set(t).where(eq(n.id, e)), { success: true };
  } catch (t) {
    return console.error("Update user error:", t), { success: false, error: "Failed to update user" };
  }
}, "src_lib_users_ts--updateUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), J = E$1(async function(e) {
  try {
    return await p.delete(n).where(eq(n.id, e)), { success: true };
  } catch (s) {
    return console.error("Delete user error:", s), { success: false, error: "Failed to delete user" };
  }
}, "src_lib_users_ts--deleteUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server=");

export { R as createUser_1, J as deleteUser_1, P as getUser_1, C as getUsers_1, E as updateUser_1 };
//# sourceMappingURL=users-DUDoXUFs.mjs.map
