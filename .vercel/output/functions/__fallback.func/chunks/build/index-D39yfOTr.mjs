import { E } from './server-fns-runtime-HUGH5Jm0.mjs';
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

const p = E(async () => {
  const { getUser: e } = await import('./session-D_Gl5yQj.mjs');
  return await e() || "Guest";
}, "src_routes_dashboard_index_tsx--getAuthenticatedUser_1", "/Users/dedirosandi/Documents/PROJECT/program-ela/src/routes/dashboard/index.tsx?pick=default&pick=%24css&tsr-directive-use-server=");

export { p as getAuthenticatedUser_1 };
//# sourceMappingURL=index-D39yfOTr.mjs.map
