import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
import { db as p$1 } from './index-BinUX9hy.mjs';
import { p as s } from './schema-DxiP6MVG.mjs';
import { eq, desc } from 'drizzle-orm';

const i = E(async function() {
  return await p$1.select().from(s).orderBy(desc(s.createdAt));
}, "src_lib_products_ts--getProducts_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), g = i, n = E(async function(e) {
  return (await p$1.select().from(s).where(eq(s.id, e)))[0];
}, "src_lib_products_ts--getProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), v = n, p = E(async function(e) {
  try {
    return await p$1.insert(s).values(e), { success: true };
  } catch (t) {
    return console.error("Create product error:", t), { success: false, error: "Failed to create product" };
  }
}, "src_lib_products_ts--createProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), b = p, l = E(async function(e, t) {
  try {
    return await p$1.update(s).set({ ...t, updatedAt: /* @__PURE__ */ new Date() }).where(eq(s.id, e)), { success: true };
  } catch (u) {
    return console.error("Update product error:", u), { success: false, error: "Failed to update product" };
  }
}, "src_lib_products_ts--updateProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server="), w = l;
E(async function(e) {
  try {
    return await p$1.delete(s).where(eq(s.id, e)), { success: true };
  } catch (t) {
    return console.error("Delete product error:", t), { success: false, error: "Failed to delete product" };
  }
}, "src_lib_products_ts--deleteProduct_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/lib/products.ts?tsr-directive-use-server=");

export { b, g, v, w };
//# sourceMappingURL=products-BWm0EwFZ.mjs.map
