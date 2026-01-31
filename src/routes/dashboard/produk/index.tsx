import { createAsync, A } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { For, Show } from "solid-js";
import { getProducts, deleteProduct } from "~/lib/products";

// Icon components (Pencil/Trash) can be added here or reused if extracted
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
)

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

export default function ProdukIndex() {
    console.log("[ProdukIndex] Component mounting...");
    const products = createAsync(async () => {
        console.log("[ProdukIndex] Fetching products...");
        try {
            const res = await getProducts();
            console.log("[ProdukIndex] Products fetched:", res?.length);
            return res;
        } catch (e) {
            console.error("[ProdukIndex] Error fetching products:", e);
            throw e;
        }
    });


    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
            // In a real app, you might want to revalidate data here
            // or use solid-router's revalidation mechanisms
            window.location.reload();
        }
    };

    return (
        <div>
            <Title>Produk | ElaApp</Title>

            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Produk</h1>
                    <p class="text-slate-500 mt-2">Manage your product inventory.</p>
                </div>
                <A
                    href="/dashboard/produk/create"
                    class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Product
                </A>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-slate-600">
                        <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th class="px-6 py-4">Brand</th>
                                <th class="px-6 py-4">Kode Barang</th>
                                <th class="px-6 py-4">Nama Barang</th>
                                <th class="px-6 py-4">Gramasi</th>
                                <th class="px-6 py-4">Satuan</th>
                                <th class="px-6 py-4 text-right">Harga</th>
                                <th class="px-6 py-4 text-center">Stok</th>
                                <th class="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            <Show
                                when={products() && products()!.length > 0}
                                fallback={
                                    <tr>
                                        <td colspan="8" class="px-6 py-12 text-center text-slate-400">
                                            No products found. Add your first one!
                                        </td>
                                    </tr>
                                }
                            >
                                <For each={products()}>
                                    {(product) => (
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="px-6 py-4 font-medium text-slate-900 capitalize">{product.brand}</td>
                                            <td class="px-6 py-4 font-mono text-xs bg-slate-100 rounded-md py-1 px-2 w-fit">{product.kodeBarang}</td>
                                            <td class="px-6 py-4">{product.namaBarang}</td>
                                            <td class="px-6 py-4">{product.gramasi || "-"}</td>
                                            <td class="px-6 py-4">{product.satuan || "-"}</td>
                                            <td class="px-6 py-4 text-right font-medium">Rp {product.harga.toLocaleString()}</td>
                                            <td class="px-6 py-4 text-center">
                                                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stok > 10 ? 'bg-emerald-100 text-emerald-800' :
                                                    product.stok > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stok}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <div class="flex items-center justify-center gap-2">
                                                    <A href={`/dashboard/produk/${product.id}/edit`} class="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors" title="Edit">
                                                        <PencilIcon />
                                                    </A>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </For>
                            </Show>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
