import { createResource, catchError, untrack, sharedConfig } from 'solid-js';
import { isServer } from 'solid-js/web';

function y(r, n) {
  let t, c = () => !t || t.state === "unresolved" ? void 0 : t.latest;
  [t] = createResource(() => o(r, catchError(() => untrack(c), () => {
  })), (s) => s, n);
  const a = () => t();
  return Object.defineProperty(a, "latest", { get() {
    return t.latest;
  } }), a;
}
class e {
  static all() {
    return new e();
  }
  static allSettled() {
    return new e();
  }
  static any() {
    return new e();
  }
  static race() {
    return new e();
  }
  static reject() {
    return new e();
  }
  static resolve() {
    return new e();
  }
  catch() {
    return new e();
  }
  then() {
    return new e();
  }
  finally() {
    return new e();
  }
}
function o(r, n) {
  if (isServer || !sharedConfig.context) return r(n);
  const t = fetch, c = Promise;
  try {
    return window.fetch = () => new e(), Promise = e, r(n);
  } finally {
    window.fetch = t, Promise = c;
  }
}

export { y };
//# sourceMappingURL=createAsync-CBz8AaaQ2.mjs.map
