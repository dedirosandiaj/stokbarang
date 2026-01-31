import { z } from 'zod';
import { ssr, ssrHydrationKey, ssrAttribute, escape, createComponent, ssrElement, mergeProps } from 'solid-js/web';
import { splitProps, Show, For } from 'solid-js';

z.object({ brand: z.enum(["nayyacorner", "inacookies"], { message: "Please select a valid brand" }), kodeBarang: z.string().min(1, "Product code is required"), namaBarang: z.string().min(1, "Product name is required"), gramasi: z.number().nullable().optional(), satuan: z.string().nullable().optional(), harga: z.number().min(0, "Price must be non-negative"), stok: z.number().int().min(0, "Stock must be non-negative") });
z.object({ username: z.string().min(3, "Username must be at least 3 characters"), password: z.string().min(6, "Password must be at least 6 characters"), role: z.enum(["admin", "kasir"]).default("kasir") });
z.object({ username: z.string().min(3, "Username must be at least 3 characters"), password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")), role: z.enum(["admin", "kasir"]).default("kasir") });
z.object({ username: z.string().min(1, "Username is required"), password: z.string().min(1, "Password is required") });
var h = ["<label", ' class="block text-sm font-semibold text-slate-700 mb-2">', "</label>"], w = ["<p", ' class="mt-1 text-sm text-red-500">', "</p>"], f = ["<div", "><!--$-->", "<!--/-->", "<!--$-->", "<!--/--></div>"];
const j = (o) => {
  const [e, l] = splitProps(o, ["label", "error", "class", "wrapperClass"]);
  return ssr(f, ssrHydrationKey() + ssrAttribute("class", escape(e.wrapperClass, true), false), escape(createComponent(Show, { get when() {
    return e.label;
  }, get children() {
    return ssr(h, ssrHydrationKey(), escape(e.label));
  } })), ssrElement("input", mergeProps({ get class() {
    return `w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${e.error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} ${e.class || ""}`;
  } }, l), void 0, false), escape(createComponent(Show, { get when() {
    return e.error;
  }, get children() {
    return ssr(w, ssrHydrationKey(), escape(e.error));
  } })));
};
var v = ["<label", ' class="block text-sm font-semibold text-slate-700 mb-2">', "</label>"], x = ["<p", ' class="mt-1 text-sm text-red-500">', "</p>"], $ = ["<div", "><!--$-->", '<!--/--><div class="relative">', '<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg></div></div><!--$-->', "<!--/--></div>"], y = ["<option", ">", "</option>"];
const B = (o) => {
  const [e, l] = splitProps(o, ["label", "error", "class", "wrapperClass", "options"]);
  return ssr($, ssrHydrationKey() + ssrAttribute("class", escape(e.wrapperClass, true), false), escape(createComponent(Show, { get when() {
    return e.label;
  }, get children() {
    return ssr(v, ssrHydrationKey(), escape(e.label));
  } })), ssrElement("select", mergeProps({ get class() {
    return `w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none appearance-none font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${e.error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} ${e.class || ""}`;
  } }, l), () => escape(createComponent(For, { get each() {
    return e.options;
  }, children: (d) => ssr(y, ssrHydrationKey() + ssrAttribute("value", escape(d.value, true), false), escape(d.label)) })), false), escape(createComponent(Show, { get when() {
    return e.error;
  }, get children() {
    return ssr(x, ssrHydrationKey(), escape(e.error));
  } })));
};
var k = ["<svg", ' class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>'];
const q = (o) => {
  const [e, l] = splitProps(o, ["variant", "isLoading", "class", "children", "disabled"]), b = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 focus:ring-indigo-100", secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm focus:ring-slate-100", danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 focus:ring-red-100", ghost: "text-indigo-600 hover:bg-indigo-50 border-transparent" }[e.variant || "primary"];
  return ssrElement("button", mergeProps({ get class() {
    return `px-6 py-2.5 font-semibold rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 ${b} ${e.class || ""}`;
  }, get disabled() {
    return e.disabled || e.isLoading;
  } }, l), () => ["<!--$-->", escape(createComponent(Show, { get when() {
    return e.isLoading;
  }, get children() {
    return ssr(k, ssrHydrationKey());
  } })), "<!--/-->", "<!--$-->", escape(e.children), "<!--/-->"], true);
};

export { B, j, q };
//# sourceMappingURL=Button-BuAho1tZ.mjs.map
