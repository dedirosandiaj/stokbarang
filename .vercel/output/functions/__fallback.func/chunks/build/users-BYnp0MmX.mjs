import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { db as p$1 } from './index-BinUX9hy.mjs';
import { u as n } from './schema-DxiP6MVG.mjs';
import { eq, desc } from 'drizzle-orm';
import i from 'bcryptjs';

const d = E(async function() {
  return await p$1.select().from(n).orderBy(desc(n.createdAt));
}, "src_lib_users_ts--getUsers_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), b = d, l = E(async function(r) {
  return (await p$1.select().from(n).where(eq(n.id, r)))[0];
}, "src_lib_users_ts--getUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), h = l, p = E(async function(r) {
  try {
    const s = await i.hash(r.password, 10);
    return await p$1.insert(n).values({ ...r, password: s }), { success: true };
  } catch (s) {
    return console.error("Create user error:", s), { success: false, error: "Failed to create user" };
  }
}, "src_lib_users_ts--createUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), v = p, U = E(async function(r, s) {
  try {
    const t = { ...s };
    return t.password && (t.password = await i.hash(t.password, 10)), await p$1.update(n).set(t).where(eq(n.id, r)), { success: true };
  } catch (t) {
    return console.error("Update user error:", t), { success: false, error: "Failed to update user" };
  }
}, "src_lib_users_ts--updateUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server="), y = U;
E(async function(r) {
  try {
    return await p$1.delete(n).where(eq(n.id, r)), { success: true };
  } catch (s) {
    return console.error("Delete user error:", s), { success: false, error: "Failed to delete user" };
  }
}, "src_lib_users_ts--deleteUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/users.ts?tsr-directive-use-server=");

export { b, h, v, y };
//# sourceMappingURL=users-BYnp0MmX.mjs.map
