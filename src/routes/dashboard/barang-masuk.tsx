import { Title } from "@solidjs/meta";

export default function BarangMasuk() {
    return (
        <div>
            <Title>Barang Masuk | ElaApp</Title>
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Barang Masuk</h1>
                <p class="text-slate-500 mt-2">Manage incoming goods and inventory.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <p class="text-slate-500">Table for Incoming Goods will go here.</p>
            </div>
        </div>
    );
}
