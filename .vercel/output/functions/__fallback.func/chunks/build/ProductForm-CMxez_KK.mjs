import { createComponent, ssr, ssrHydrationKey, escape, isServer } from 'solid-js/web';
import { createSignal, Show, splitProps, sharedConfig, onMount, createMemo, untrack } from 'solid-js';
import { B, j, q } from './Button-BuAho1tZ.mjs';

function z(t, s = {}) {
  if (isServer) return (o) => o.fallback;
  const [c, g] = createSignal();
  return !s.lazy && f(t, g), (o) => {
    let l, d;
    const [, m] = splitProps(o, ["fallback"]);
    if (s.lazy && f(t, g), (l = c()) && !sharedConfig.context) return l(m);
    const [h, b] = createSignal(!sharedConfig.context);
    return onMount(() => b(true)), createMemo(() => (l = c(), d = h(), untrack(() => l && d ? l(m) : o.fallback)));
  };
}
function f(t, s) {
  t().then((c) => s(() => c.default));
}
var G = ["<form", ' class="space-y-8"><div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"><!--$-->', '<!--/--><div><label class="block text-sm font-semibold text-slate-700 mb-2">Kode Barang</label><div class="flex gap-2"><!--$-->', '<!--/--><button type="button" class="px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors flex items-center justify-center border border-indigo-200 h-[46px]" title="Scan Barcode"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></button></div></div><!--$-->', "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", "<!--/--><!--$-->", '<!--/--></div><div class="flex justify-end pt-6 border-t border-slate-100">', "</div></form>"];
const A = z(() => import('./BarcodeScanner-CiYZ4G5B.mjs'));
function R(t) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const [s, c] = createSignal(((_a = t.initialData) == null ? void 0 : _a.brand) || "nayyacorner"), [g, o] = createSignal(((_b = t.initialData) == null ? void 0 : _b.kodeBarang) || ""), [l, d] = createSignal(((_c = t.initialData) == null ? void 0 : _c.namaBarang) || ""), [m, h] = createSignal(((_e = (_d = t.initialData) == null ? void 0 : _d.gramasi) == null ? void 0 : _e.toString()) || ""), [b, y] = createSignal(((_f = t.initialData) == null ? void 0 : _f.satuan) || ""), [S, x] = createSignal(((_h = (_g = t.initialData) == null ? void 0 : _g.harga) == null ? void 0 : _h.toString()) || ""), [k, w] = createSignal(((_j = (_i = t.initialData) == null ? void 0 : _i.stok) == null ? void 0 : _j.toString()) || "0"), [B$1, v] = createSignal(false), [i, E] = createSignal({}), C = (e) => {
    o(e), v(false);
  };
  return [createComponent(Show, { get when() {
    return B$1();
  }, get children() {
    return createComponent(A, { onScanSuccess: C, onClose: () => v(false) });
  } }), ssr(G, ssrHydrationKey(), escape(createComponent(B, { label: "Brand", get value() {
    return s();
  }, onChange: (e) => c(e.currentTarget.value), get error() {
    return i().brand;
  }, options: [{ label: "Nayya Corner", value: "nayyacorner" }, { label: "Ina Cookies", value: "inacookies" }] })), escape(createComponent(j, { get value() {
    return g();
  }, onInput: (e) => o(e.currentTarget.value), get error() {
    return i().kodeBarang;
  }, wrapperClass: "flex-1", placeholder: "e.g. NC-001", class: "font-mono" })), escape(createComponent(j, { label: "Nama Barang", get value() {
    return l();
  }, onInput: (e) => d(e.currentTarget.value), get error() {
    return i().namaBarang;
  }, wrapperClass: "md:col-span-2", placeholder: "e.g. Chocolate Chip Cookies" })), escape(createComponent(j, { label: "Gramasi", type: "number", get value() {
    return m();
  }, onInput: (e) => h(e.currentTarget.value), get error() {
    return i().gramasi;
  }, placeholder: "e.g. 500" })), escape(createComponent(j, { label: "Satuan", get value() {
    return b();
  }, onInput: (e) => y(e.currentTarget.value), get error() {
    return i().satuan;
  }, placeholder: "e.g. gram, pcs, jar, box" })), escape(createComponent(j, { label: "Harga (Rp)", type: "number", get value() {
    return S();
  }, onInput: (e) => x(e.currentTarget.value), get error() {
    return i().harga;
  }, placeholder: "0" })), escape(createComponent(j, { label: "Stok Awal", type: "number", get value() {
    return k();
  }, onInput: (e) => w(e.currentTarget.value), get error() {
    return i().stok;
  }, placeholder: "0" })), escape(createComponent(q, { type: "submit", get isLoading() {
    return t.isSubmitting;
  }, get disabled() {
    return t.isSubmitting;
  }, children: "Save Product" })))];
}

export { R };
//# sourceMappingURL=ProductForm-CMxez_KK.mjs.map
