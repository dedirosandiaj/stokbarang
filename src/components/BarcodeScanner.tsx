import { onMount, onCleanup, createSignal, Show } from "solid-js";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type BarcodeScannerProps = {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
};

export default function BarcodeScanner(props: BarcodeScannerProps) {
    let scannerId = "reader";
    let html5Qrcode: Html5Qrcode | null = null;
    const [error, setError] = createSignal("");

    onMount(() => {
        // Initialize the scanner instance with specific formats for Barcodes
        // Enable experimental features for better performance if supported
        html5Qrcode = new Html5Qrcode(scannerId, {
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODABAR
            ],
            verbose: false,
            // Use native barcode detector if available (much faster/better)
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        });

        const config = {
            fps: 30, // Increased FPS for better sensitivity
            qrbox: { width: 300, height: 150 }, // Rectangular box for barcodes
            aspectRatio: 1.0,
            videoConstraints: {
                facingMode: "environment",
                focusMode: "continuous" // Try to force continuous focus
            }
        };

        // Start scanning automatically
        html5Qrcode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                // Success callback
                props.onScanSuccess(decodedText);
            },
            (errorMessage) => {
                // Scan failure (normal during scanning)
            }
        ).catch((err) => {
            console.error("Error starting scanner:", err);
            setError("Could not start camera. Please ensure permissions are granted.");
        });
    });

    onCleanup(async () => {
        if (html5Qrcode && html5Qrcode.isScanning) {
            try {
                await html5Qrcode.stop();
                html5Qrcode.clear();
            } catch (err) {
                console.error("Failed to stop scanner:", err);
            }
        }
    });

    return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 class="font-bold text-slate-800">Scan Barcode</h3>
                    <button
                        onClick={props.onClose}
                        class="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div class="p-6 relative bg-black">
                    <Show when={error()}>
                        <div class="absolute inset-0 flex items-center justify-center text-white text-center p-4 z-10">
                            {error()}
                        </div>
                    </Show>

                    {/* The reader div */}
                    <div id={scannerId} class="rounded-lg overflow-hidden w-full h-full min-h-[300px]"></div>

                    <div class="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                        <p class="text-white/80 text-sm bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                            Align barcode within the box
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
