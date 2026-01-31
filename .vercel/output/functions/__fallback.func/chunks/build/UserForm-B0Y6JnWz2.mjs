import { ssr, ssrHydrationKey, escape, createComponent } from 'solid-js/web';
import { createSignal } from 'solid-js';
import { j, B, q } from './Button-BuAho1tZ2.mjs';

var w = ["<form", ' class="space-y-8"><div class="grid grid-cols-1 gap-x-8 gap-y-6 max-w-2xl"><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--></div><div class="flex justify-start pt-6 border-t border-slate-100">', "</div></form>"];
function S(e) {
  var _a, _b;
  const n = !!e.initialData, [i, u] = createSignal(((_a = e.initialData) == null ? void 0 : _a.username) || ""), [d, c] = createSignal(""), [g, m] = createSignal(((_b = e.initialData) == null ? void 0 : _b.role) || "kasir"), [o, y] = createSignal({});
  return ssr(w, ssrHydrationKey(), escape(createComponent(j, { label: "Username", get value() {
    return i();
  }, onInput: (r) => u(r.currentTarget.value), get error() {
    return o().username;
  }, placeholder: "e.g. john_doe" })), escape(createComponent(j, { label: `Password ${n ? "(Leave blank to keep unchanged)" : ""}`, type: "password", get value() {
    return d();
  }, onInput: (r) => c(r.currentTarget.value), get error() {
    return o().password;
  }, placeholder: n ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "Enter password" })), escape(createComponent(B, { label: "Role", get value() {
    return g();
  }, onChange: (r) => m(r.currentTarget.value), get error() {
    return o().role;
  }, options: [{ label: "Kasir", value: "kasir" }, { label: "Admin", value: "admin" }] })), escape(createComponent(q, { type: "submit", get isLoading() {
    return e.isSubmitting;
  }, get disabled() {
    return e.isSubmitting;
  }, children: n ? "Update User" : "Create User" })));
}

export { S };
//# sourceMappingURL=UserForm-B0Y6JnWz2.mjs.map
