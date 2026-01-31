import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { db as p } from './index-BinUX9hy.mjs';
import { p as s } from './schema-DxiP6MVG.mjs';
import { desc, eq } from 'drizzle-orm';
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
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

const D = E(async function() {
  return await p.select().from(s).orderBy(desc(s.createdAt));
}, "src_lib_products_ts--getProducts_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), h = E(async function(e) {
  return (await p.select().from(s).where(eq(s.id, e)))[0];
}, "src_lib_products_ts--getProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), C = E(async function(e) {
  try {
    return await p.insert(s).values(e), { success: true };
  } catch (t) {
    return console.error("Create product error:", t), { success: false, error: "Failed to create product" };
  }
}, "src_lib_products_ts--createProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), R = E(async function(e, t) {
  try {
    return await p.update(s).set({ ...t, updatedAt: /* @__PURE__ */ new Date() }).where(eq(s.id, e)), { success: true };
  } catch (u) {
    return console.error("Update product error:", u), { success: false, error: "Failed to update product" };
  }
}, "src_lib_products_ts--updateProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), U = E(async function(e) {
  try {
    return await p.delete(s).where(eq(s.id, e)), { success: true };
  } catch (t) {
    return console.error("Delete product error:", t), { success: false, error: "Failed to delete product" };
  }
}, "src_lib_products_ts--deleteProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server=");

export { C as createProduct_1, U as deleteProduct_1, h as getProduct_1, D as getProducts_1, R as updateProduct_1 };
//# sourceMappingURL=products-QOPIUUBV.mjs.map
