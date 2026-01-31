import { drizzle } from 'drizzle-orm/postgres-js';
import t from 'postgres';
import { a as d } from './schema-DxiP6MVG.mjs';
import 'drizzle-orm/pg-core';

const o = process.env.DATABASE_URL;
o ? console.log("\u2705 Database connecting to:", o.split("@")[1] || "unknown host") : console.error("\u274C CRITICAL: DATABASE_URL is missing or empty!");
const e = t(o || "postgres://dummy:dummy@localhost:5432/dummy"), p = drizzle(e, { schema: d });

export { p as db };
//# sourceMappingURL=index-BinUX9hy.mjs.map
