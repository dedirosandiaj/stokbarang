import { ssrElement, mergeProps as mergeProps$1 } from 'solid-js/web';
import { mergeProps, splitProps, createMemo } from 'solid-js';
import { M as Me, c as De, W as We, $ as $e, L } from '../nitro/nitro.mjs';

function y(t) {
  t = mergeProps({ inactiveClass: "inactive", activeClass: "active" }, t);
  const [, e] = splitProps(t, ["href", "state", "class", "activeClass", "inactiveClass", "end"]), r = We(() => t.href), s = $e(r), o = De(), a = createMemo(() => {
    const c = r();
    if (c === void 0) return [false, false];
    const n = L(c.split(/[?#]/, 1)[0]).toLowerCase(), i = decodeURI(L(o.pathname).toLowerCase());
    return [t.end ? n === i : i.startsWith(n + "/") || i === n, n === i];
  });
  return ssrElement("a", mergeProps$1(e, { get href() {
    return s() || t.href;
  }, get state() {
    return JSON.stringify(t.state);
  }, get classList() {
    return { ...t.class && { [t.class]: true }, [t.inactiveClass]: !a()[0], [t.activeClass]: a()[0], ...e.classList };
  }, link: true, get "aria-current"() {
    return a()[1] ? "page" : void 0;
  } }), void 0, true);
}
function A(t) {
  const e = Me(), r = De(), { href: s, state: o } = t, a = typeof s == "function" ? s({ navigate: e, location: r }) : s;
  return e(a, { replace: true, state: o }), null;
}

export { A, y };
//# sourceMappingURL=components-BfweKUze.mjs.map
