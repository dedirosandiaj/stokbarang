
import { createSignal, Show } from "solid-js";
import { NewProduct, Product } from "~/lib/products";
import BarcodeScanner from "./BarcodeScanner";
import { productSchema, ProductInput } from "~/lib/validations";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";

type ProductFormProps = {
    initialData?: Product;
    onSubmit: (data: NewProduct) => Promise<void>;
    isSubmitting: boolean;
};

export default function ProductForm(props: ProductFormProps) {
    const [brand, setBrand] = createSignal<string>(props.initialData?.brand || "nayyacorner");
    const [kodeBarang, setKodeBarang] = createSignal(props.initialData?.kodeBarang || "");
    const [namaBarang, setNamaBarang] = createSignal(props.initialData?.namaBarang || "");
    const [gramasi, setGramasi] = createSignal(props.initialData?.gramasi?.toString() || "");
    const [satuan, setSatuan] = createSignal(props.initialData?.satuan || "");
    const [harga, setHarga] = createSignal(props.initialData?.harga?.toString() || "");
    const [stok, setStok] = createSignal(props.initialData?.stok?.toString() || "0");

    const [showScanner, setShowScanner] = createSignal(false);
    const [errors, setErrors] = createSignal<Record<string, string>>({});

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        const rawData = {
            brand: brand(),
            kodeBarang: kodeBarang(),
            namaBarang: namaBarang(),
            gramasi: gramasi() ? Number(gramasi()) : null,
            satuan: satuan() || null,
            harga: Number(harga()),
            stok: Number(stok()),
        };

        const result = productSchema.safeParse(rawData);

        if (!result.success) {
            const flattened = result.error.flatten();
            const fieldErrors: Record<string, string> = {};
            // Flatten returns arrays of strings for each field. We take the first one.
            Object.entries(flattened.fieldErrors).forEach(([key, msgs]) => {
                if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        await props.onSubmit(result.data as NewProduct);
    };

    const handleScanSuccess = (decodedText: string) => {
        setKodeBarang(decodedText);
        setShowScanner(false);
    };

    return (
        <>
            <Show when={showScanner()}>
                <BarcodeScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setShowScanner(false)}
                />
            </Show>

            <form onSubmit={handleSubmit} class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                    {/* Brand */}
                    <Select
                        label="Brand"
                        value={brand()}
                        onChange={(e) => setBrand(e.currentTarget.value)}
                        error={errors().brand}
                        options={[
                            { label: "Nayya Corner", value: "nayyacorner" },
                            { label: "Ina Cookies", value: "inacookies" }
                        ]}
                    />

                    {/* Kode Barang + Scanner Button */}
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Kode Barang</label>
                        <div class="flex gap-2">
                            <Input
                                value={kodeBarang()}
                                onInput={(e) => setKodeBarang(e.currentTarget.value)}
                                error={errors().kodeBarang}
                                wrapperClass="flex-1"
                                placeholder="e.g. NC-001"
                                class="font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                class="px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors flex items-center justify-center border border-indigo-200 h-[46px]" // manual height adjustment to match input default
                                title="Scan Barcode"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                        </div>
                    </div>

                    {/* Nama Barang */}
                    <Input
                        label="Nama Barang"
                        value={namaBarang()}
                        onInput={(e) => setNamaBarang(e.currentTarget.value)}
                        error={errors().namaBarang}
                        wrapperClass="md:col-span-2"
                        placeholder="e.g. Chocolate Chip Cookies"
                    />

                    {/* Gramasi */}
                    <Input
                        label="Gramasi"
                        type="number"
                        value={gramasi()}
                        onInput={(e) => setGramasi(e.currentTarget.value)}
                        error={errors().gramasi}
                        placeholder="e.g. 500"
                    />

                    {/* Satuan */}
                    <Input
                        label="Satuan"
                        value={satuan()}
                        onInput={(e) => setSatuan(e.currentTarget.value)}
                        error={errors().satuan}
                        placeholder="e.g. gram, pcs, jar, box"
                    />

                    {/* Harga */}
                    <Input
                        label="Harga (Rp)"
                        type="number"
                        value={harga()}
                        onInput={(e) => setHarga(e.currentTarget.value)}
                        error={errors().harga}
                        placeholder="0"
                    />

                    {/* Stok */}
                    <Input
                        label="Stok Awal"
                        type="number"
                        value={stok()}
                        onInput={(e) => setStok(e.currentTarget.value)}
                        error={errors().stok}
                        placeholder="0"
                    />
                </div>

                <div class="flex justify-end pt-6 border-t border-slate-100">
                    <Button
                        type="submit"
                        isLoading={props.isSubmitting}
                        disabled={props.isSubmitting}
                    >
                        Save Product
                    </Button>
                </div>
            </form>
        </>
    );
}
