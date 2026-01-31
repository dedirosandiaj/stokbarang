import { createMemo, $TRACK, createSignal, getOwner, onCleanup, startTransition, getListener, sharedConfig } from 'solid-js';
import { isServer, getRequestEvent } from 'solid-js/web';
import { b as E, R as Re, M as Me, H as He, K as Ke } from './routing-CMRlbYJP.mjs';

const q = "Location", W = 5e3, G = 18e4;
let b = /* @__PURE__ */ new Map();
isServer || setInterval(() => {
  const e = Date.now();
  for (let [t, r] of b.entries()) !r[4].count && e - r[0] > G && b.delete(t);
}, 3e5);
function R() {
  if (!isServer) return b;
  const e = getRequestEvent();
  if (!e) throw new Error("Cannot find cache context");
  return (e.router || (e.router = {})).cache || (e.router.cache = /* @__PURE__ */ new Map());
}
function N(e, t = true) {
  return startTransition(() => {
    const r = Date.now();
    M(e, (o) => {
      t && (o[0] = 0), o[4][1](r);
    });
  });
}
function M(e, t) {
  e && !Array.isArray(e) && (e = [e]);
  for (let r of b.keys()) (e === void 0 || D(r, e)) && t(b.get(r));
}
function P(e, t) {
  e.GET && (e = e.GET);
  const r = (...o) => {
    const n = R(), a = He(), f = Ke(), A = getOwner() ? Me() : void 0, m = Date.now(), l = t + S(o);
    let s = n.get(l), p;
    if (isServer) {
      const i = getRequestEvent();
      if (i) {
        const u = (i.router || (i.router = {})).dataOnly;
        if (u) {
          const w = i && (i.router.data || (i.router.data = {}));
          if (w && l in w) return w[l];
          if (Array.isArray(u) && !D(l, u)) return w[l] = void 0, Promise.resolve();
        }
      }
    }
    if (getListener() && !isServer && (p = true, onCleanup(() => s[4].count--)), s && s[0] && (isServer || a === "native" || s[4].count || Date.now() - s[0] < W)) {
      p && (s[4].count++, s[4][0]()), s[3] === "preload" && a !== "preload" && (s[0] = m);
      let i = s[1];
      return a !== "preload" && (i = "then" in s[1] ? s[1].then(g(false), g(true)) : g(false)(s[1]), !isServer && a === "navigate" && startTransition(() => s[4][1](s[0]))), f && "then" in i && i.catch(() => {
      }), i;
    }
    let c;
    if (!isServer && sharedConfig.has && sharedConfig.has(l) ? (c = sharedConfig.load(l), delete globalThis._$HY.r[l]) : c = e(...o), s ? (s[0] = m, s[1] = c, s[3] = a, !isServer && a === "navigate" && startTransition(() => s[4][1](s[0]))) : (n.set(l, s = [m, c, , a, createSignal(m)]), s[4].count = 0), p && (s[4].count++, s[4][0]()), isServer) {
      const i = getRequestEvent();
      if (i && i.router.dataOnly) return i.router.data[l] = c;
    }
    if (a !== "preload" && (c = "then" in c ? c.then(g(false), g(true)) : g(false)(c)), f && "then" in c && c.catch(() => {
    }), isServer && sharedConfig.context && sharedConfig.context.async && !sharedConfig.context.noHydrate) {
      const i = getRequestEvent();
      (!i || !i.serverOnly) && sharedConfig.context.serialize(l, c);
    }
    return c;
    function g(i) {
      return async (u) => {
        if (u instanceof Response) {
          const w = getRequestEvent();
          if (w) for (const [F, T] of u.headers) F == "set-cookie" ? w.response.headers.append("set-cookie", T) : w.response.headers.set(F, T);
          const C = u.headers.get(q);
          if (C !== null) {
            A && C.startsWith("/") ? startTransition(() => {
              A(C, { replace: true });
            }) : isServer ? w && (w.response.status = 302) : window.location.href = C;
            return;
          }
          u.customBody && (u = await u.customBody());
        }
        if (i) throw u;
        return s[2] = u, u;
      };
    }
  };
  return r.keyFor = (...o) => t + S(o), r.key = t, r;
}
P.get = (e) => R().get(e)[2];
P.set = (e, t) => {
  const r = R(), o = Date.now();
  let n = r.get(e);
  n ? (n[0] = o, n[1] = Promise.resolve(t), n[2] = t, n[3] = "preload") : (r.set(e, n = [o, Promise.resolve(t), t, "preload", createSignal(o)]), n[4].count = 0);
};
P.delete = (e) => R().delete(e);
P.clear = () => R().clear();
function D(e, t) {
  for (let r of t) if (r && e.startsWith(r)) return true;
  return false;
}
function S(e) {
  return JSON.stringify(e, (t, r) => z(r) ? Object.keys(r).sort().reduce((o, n) => (o[n] = r[n], o), {}) : r);
}
function z(e) {
  let t;
  return e != null && typeof e == "object" && (!(t = Object.getPrototypeOf(e)) || t === Object.prototype);
}
const _ = /* @__PURE__ */ new Map();
function J(e, t) {
  const r = E(), o = createMemo(() => r.submissions[0]().filter((n) => n.url === e.base && true));
  return new Proxy([], { get(n, a) {
    return a === $TRACK ? o() : a === "pending" ? o().some((f) => !f.result) : o()[a];
  }, has(n, a) {
    return a in o();
  } });
}
function te(e, t) {
  const r = J(e);
  return new Proxy({}, { get(o, n) {
    var _a;
    return r.length === 0 && n === "clear" || n === "retry" ? () => {
    } : (_a = r[r.length - 1]) == null ? void 0 : _a[n];
  } });
}
function re(e, t = {}) {
  function r(...a) {
    const f = this.r, d = this.f, A = (f.singleFlight && e.withOptions ? e.withOptions({ headers: { "X-Single-Flight": "true" } }) : e)(...a), [m, l] = createSignal();
    let s;
    function p(c) {
      return async (g) => {
        var _a;
        const i = await Q(g, c, f.navigatorFactory());
        let u = null;
        if ((_a = o.onComplete) == null ? void 0 : _a.call(o, { ...s, result: i == null ? void 0 : i.data, error: i == null ? void 0 : i.error, pending: false, retry() {
          return u = s.retry();
        } }), u) return u;
        if (!i) return s.clear();
        if (l(i), i.error && !d) throw i.error;
        return i.data;
      };
    }
    return f.submissions[1]((c) => [...c, s = { input: a, url: n, get result() {
      var _a;
      return (_a = m()) == null ? void 0 : _a.data;
    }, get error() {
      var _a;
      return (_a = m()) == null ? void 0 : _a.error;
    }, get pending() {
      return !m();
    }, clear() {
      f.submissions[1]((g) => g.filter((i) => i !== s));
    }, retry() {
      return l(void 0), e(...a).then(p(), p(true));
    } }]), A.then(p(), p(true));
  }
  const o = typeof t == "string" ? { name: t } : t, n = e.url || o.name && `https://action/${o.name}` || (isServer ? "" : `https://action/${Y(e.toString())}`);
  return r.base = n, $(r, n);
}
function $(e, t) {
  return e.toString = () => {
    if (!t) throw new Error("Client Actions need explicit names if server rendered");
    return t;
  }, e.with = function(...r) {
    const o = function(...a) {
      return e.call(this, ...r, ...a);
    };
    o.base = e.base;
    const n = new URL(t, Re);
    return n.searchParams.set("args", S(r)), $(o, (n.origin === "https://action" ? n.origin : "") + n.pathname + n.search);
  }, e.url = t, isServer || (_.set(t, e), getOwner() && onCleanup(() => _.delete(t))), e;
}
const Y = (e) => e.split("").reduce((t, r) => (t << 5) - t + r.charCodeAt(0) | 0, 0);
async function Q(e, t, r) {
  let o, n, a, f;
  if (e instanceof Response) {
    if (e.headers.has("X-Revalidate") && (a = e.headers.get("X-Revalidate").split(",")), e.customBody && (o = n = await e.customBody(), e.headers.has("X-Single-Flight") && (o = o._$value, delete n._$value, f = Object.keys(n))), e.headers.has("Location")) {
      const d = e.headers.get("Location") || "/";
      d.startsWith("http") ? window.location.href = d : r(d);
    }
  } else {
    if (t) return { error: e };
    o = e;
  }
  return M(a, (d) => d[0] = 0), f && f.forEach((d) => P.set(d, n[d])), await N(a, false), o != null ? { data: o } : void 0;
}

export { _, re as r, te as t };
//# sourceMappingURL=action-CnXm9LBs.mjs.map
