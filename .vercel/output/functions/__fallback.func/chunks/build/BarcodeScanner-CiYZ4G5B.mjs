import { ssr, ssrHydrationKey, escape, createComponent, ssrAttribute } from 'solid-js/web';
import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

var x = ["<div", ' class="absolute inset-0 flex items-center justify-center text-white text-center p-4 z-10">', "</div>"], g = ["<div", ' class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"><div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 class="font-bold text-slate-800">Scan Barcode</h3><button class="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div><div class="p-6 relative bg-black"><!--$-->', "<!--/--><div", ' class="rounded-lg overflow-hidden w-full h-full min-h-[300px]"></div><div class="absolute bottom-4 left-0 right-0 text-center pointer-events-none"><p class="text-white/80 text-sm bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur-md">Align barcode within the box</p></div></div></div></div>'];
function k(c) {
  let s = "reader", t = null;
  const [i, d] = createSignal("");
  return onMount(() => {
    t = new Html5Qrcode(s, { formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E, Html5QrcodeSupportedFormats.CODABAR], verbose: false, experimentalFeatures: { useBarCodeDetectorIfSupported: true } });
    const o = { fps: 30, qrbox: { width: 300, height: 150 }, aspectRatio: 1, videoConstraints: { facingMode: "environment", focusMode: "continuous" } };
    t.start({ facingMode: "environment" }, o, (r) => {
      c.onScanSuccess(r);
    }, (r) => {
    }).catch((r) => {
      console.error("Error starting scanner:", r), d("Could not start camera. Please ensure permissions are granted.");
    });
  }), onCleanup(async () => {
    if (t && t.isScanning) try {
      await t.stop(), t.clear();
    } catch (o) {
      console.error("Failed to stop scanner:", o);
    }
  }), ssr(g, ssrHydrationKey(), escape(createComponent(Show, { get when() {
    return i();
  }, get children() {
    return ssr(x, ssrHydrationKey(), escape(i()));
  } })), ssrAttribute("id", escape(s, true), false));
}

export { k as default };
//# sourceMappingURL=BarcodeScanner-CiYZ4G5B.mjs.map
