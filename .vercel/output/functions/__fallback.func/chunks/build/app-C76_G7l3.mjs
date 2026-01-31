import { createComponent, ssr, ssrHydrationKey, escape, isServer, getRequestEvent, delegateEvents } from 'solid-js/web';
import { I, k } from './index-Dps0aSs2.mjs';
import { A as Ae } from '../nitro/nitro.mjs';
import { ErrorBoundary, Suspense, createSignal, onCleanup, children, createMemo, getOwner, sharedConfig, untrack, Show, on, createRoot } from 'solid-js';
import { s } from './Loading-b-bAnbUN.mjs';
import { O as Oe, T as Te, E as Ee, R as Re, H as He, k as ke, a as M, t as te, N as Ne, I as Ie, V, y as ye, q as qe } from './routing-CMRlbYJP.mjs';
import { _ } from './action-CnXm9LBs.mjs';
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
import 'solid-js/web/storage';

const B = (t) => (r) => {
  const { base: o } = r, n = children(() => r.children), e = createMemo(() => Oe(n(), r.base || ""));
  let s;
  const c = Te(t, e, () => s, { base: o, singleFlight: r.singleFlight, transformUrl: r.transformUrl });
  return t.create && t.create(c), createComponent(Ee.Provider, { value: c, get children() {
    return createComponent(ct, { routerState: c, get root() {
      return r.root;
    }, get preload() {
      return r.rootPreload || r.rootLoad;
    }, get children() {
      return [(s = getOwner()) && null, createComponent(ut, { routerState: c, get branches() {
        return e();
      } })];
    } });
  } });
};
function ct(t) {
  const r = t.routerState.location, o = t.routerState.params, n = createMemo(() => t.preload && untrack(() => {
    Ne(true), t.preload({ params: o, location: r, intent: He() || "initial" }), Ne(false);
  }));
  return createComponent(Show, { get when() {
    return t.root;
  }, keyed: true, get fallback() {
    return t.children;
  }, children: (e) => createComponent(e, { params: o, location: r, get data() {
    return n();
  }, get children() {
    return t.children;
  } }) });
}
function ut(t) {
  if (isServer) {
    const e = getRequestEvent();
    if (e && e.router && e.router.dataOnly) {
      lt(e, t.routerState, t.branches);
      return;
    }
    e && ((e.router || (e.router = {})).matches || (e.router.matches = t.routerState.matches().map(({ route: s, path: c, params: f }) => ({ path: s.originalPath, pattern: s.pattern, match: c, params: f, info: s.info }))));
  }
  const r = [];
  let o;
  const n = createMemo(on(t.routerState.matches, (e, s, c) => {
    let f = s && e.length === s.length;
    const m = [];
    for (let l = 0, w = e.length; l < w; l++) {
      const p = s && s[l], g = e[l];
      c && p && g.route.key === p.route.key ? m[l] = c[l] : (f = false, r[l] && r[l](), createRoot((R) => {
        r[l] = R, m[l] = ke(t.routerState, m[l - 1] || t.routerState.base, O(() => n()[l + 1]), () => {
          var _a;
          const b = t.routerState.matches();
          return (_a = b[l]) != null ? _a : b[0];
        });
      }));
    }
    return r.splice(e.length).forEach((l) => l()), c && f ? c : (o = m[0], m);
  }));
  return O(() => n() && o)();
}
const O = (t) => () => createComponent(Show, { get when() {
  return t();
}, keyed: true, children: (r) => createComponent(te.Provider, { value: r, get children() {
  return r.outlet();
} }) });
function lt(t, r, o) {
  const n = new URL(t.request.url), e = M(o, new URL(t.router.previousUrl || t.request.url).pathname), s = M(o, n.pathname);
  for (let c = 0; c < s.length; c++) {
    (!e[c] || s[c].route !== e[c].route) && (t.router.dataOnly = true);
    const { route: f, params: m } = s[c];
    f.preload && f.preload({ params: m, location: r.location, intent: "preload" });
  }
}
function dt([t, r], o, n) {
  return [t, n ? (e) => r(n(e)) : r];
}
function ht(t) {
  let r = false;
  const o = (e) => typeof e == "string" ? { value: e } : e, n = dt(createSignal(o(t.get()), { equals: (e, s) => e.value === s.value && e.state === s.state }), void 0, (e) => (!r && t.set(e), sharedConfig.registry && !sharedConfig.done && (sharedConfig.done = true), e));
  return t.init && onCleanup(t.init((e = t.get()) => {
    r = true, n[1](o(e)), r = false;
  })), B({ signal: n, create: t.create, utils: t.utils });
}
function mt(t, r, o) {
  return t.addEventListener(r, o), () => t.removeEventListener(r, o);
}
function ft(t, r) {
  const o = t && document.getElementById(t);
  o ? o.scrollIntoView() : r && window.scrollTo(0, 0);
}
function gt(t) {
  const r = new URL(t);
  return r.pathname + r.search;
}
function wt(t) {
  let r;
  const o = { value: t.url || (r = getRequestEvent()) && gt(r.request.url) || "" };
  return B({ signal: [() => o, (n) => Object.assign(o, n)] })(t);
}
function pt(t = true, r = false, o = "/_server", n) {
  return (e) => {
    const s = e.base.path(), c = e.navigatorFactory(e.base);
    let f, m;
    function l(a) {
      return a.namespaceURI === "http://www.w3.org/2000/svg";
    }
    function w(a) {
      if (a.defaultPrevented || a.button !== 0 || a.metaKey || a.altKey || a.ctrlKey || a.shiftKey) return;
      const i = a.composedPath().find((k) => k instanceof Node && k.nodeName.toUpperCase() === "A");
      if (!i || r && !i.hasAttribute("link")) return;
      const d = l(i), u = d ? i.href.baseVal : i.href;
      if ((d ? i.target.baseVal : i.target) || !u && !i.hasAttribute("state")) return;
      const v = (i.getAttribute("rel") || "").split(/\s+/);
      if (i.hasAttribute("download") || v && v.includes("external")) return;
      const y = d ? new URL(u, document.baseURI) : new URL(u);
      if (!(y.origin !== window.location.origin || s && y.pathname && !y.pathname.toLowerCase().startsWith(s.toLowerCase()))) return [i, y];
    }
    function p(a) {
      const i = w(a);
      if (!i) return;
      const [d, u] = i, E = e.parsePath(u.pathname + u.search + u.hash), v = d.getAttribute("state");
      a.preventDefault(), c(E, { resolve: false, replace: d.hasAttribute("replace"), scroll: !d.hasAttribute("noscroll"), state: v ? JSON.parse(v) : void 0 });
    }
    function g(a) {
      const i = w(a);
      if (!i) return;
      const [d, u] = i;
      n && (u.pathname = n(u.pathname)), e.preloadRoute(u, d.getAttribute("preload") !== "false");
    }
    function R(a) {
      clearTimeout(f);
      const i = w(a);
      if (!i) return m = null;
      const [d, u] = i;
      m !== d && (n && (u.pathname = n(u.pathname)), f = setTimeout(() => {
        e.preloadRoute(u, d.getAttribute("preload") !== "false"), m = d;
      }, 20));
    }
    function b(a) {
      if (a.defaultPrevented) return;
      let i = a.submitter && a.submitter.hasAttribute("formaction") ? a.submitter.getAttribute("formaction") : a.target.getAttribute("action");
      if (!i) return;
      if (!i.startsWith("https://action/")) {
        const u = new URL(i, Re);
        if (i = e.parsePath(u.pathname + u.search), !i.startsWith(o)) return;
      }
      if (a.target.method.toUpperCase() !== "POST") throw new Error("Only POST forms are supported for Actions");
      const d = _.get(i);
      if (d) {
        a.preventDefault();
        const u = new FormData(a.target, a.submitter);
        d.call({ r: e, f: a.target }, a.target.enctype === "multipart/form-data" ? u : new URLSearchParams(u));
      }
    }
    delegateEvents(["click", "submit"]), document.addEventListener("click", p), t && (document.addEventListener("mousemove", R, { passive: true }), document.addEventListener("focusin", g, { passive: true }), document.addEventListener("touchstart", g, { passive: true })), document.addEventListener("submit", b), onCleanup(() => {
      document.removeEventListener("click", p), t && (document.removeEventListener("mousemove", R), document.removeEventListener("focusin", g), document.removeEventListener("touchstart", g)), document.removeEventListener("submit", b);
    });
  };
}
function bt(t) {
  if (isServer) return wt(t);
  const r = () => {
    const n = window.location.pathname.replace(/^\/+/, "/") + window.location.search, e = window.history.state && window.history.state._depth && Object.keys(window.history.state).length === 1 ? void 0 : window.history.state;
    return { value: n + window.location.hash, state: e };
  }, o = ye();
  return ht({ get: r, set({ value: n, replace: e, scroll: s, state: c }) {
    e ? window.history.replaceState(Ie(c), "", n) : window.history.pushState(c, "", n), ft(decodeURIComponent(window.location.hash.slice(1)), s), V();
  }, init: (n) => mt(window, "popstate", qe(n, (e) => {
    if (e) return !o.confirm(e);
    {
      const s = r();
      return !o.confirm(s.value, { state: s.state });
    }
  })), create: pt(t.preload, t.explicitLinks, t.actionBase, t.transformUrl), utils: { go: (n) => window.history.go(n), beforeLeave: o } })(t);
}
var vt = ["<div", ' class="p-4 bg-red-50 text-red-900 min-h-screen"><h1 class="text-2xl font-bold mb-2">Application Error</h1><pre class="whitespace-pre-wrap overflow-auto p-4 bg-red-100 rounded text-sm"><!--$-->', "<!--/--><!--$-->", "<!--/--></pre></div>"];
function qt() {
  return createComponent(bt, { root: (t) => createComponent(I, { get children() {
    return [createComponent(k, { children: "SolidStart - Basic" }), createComponent(ErrorBoundary, { fallback: (r) => ssr(vt, ssrHydrationKey(), escape(r.toString()), r.stack && `

${escape(r.stack)}`), get children() {
      return createComponent(Suspense, { get fallback() {
        return createComponent(s, {});
      }, get children() {
        return t.children;
      } });
    } })];
  } }), get children() {
    return createComponent(Ae, {});
  } });
}

export { qt as default };
//# sourceMappingURL=app-C76_G7l3.mjs.map
