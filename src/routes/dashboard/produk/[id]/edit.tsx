import { useNavigate, useParams, createAsync } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { getProduct, updateProduct, NewProduct } from "~/lib/products";
import ProductForm from "~/components/ProductForm";
import Loading from "~/components/Loading";

export default function EditProduct() {
    const params = useParams();
    const navigate = useNavigate();

    const product = createAsync(() => getProduct(params.id!));

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSubmit = async (data: NewProduct) => {
        setIsSubmitting(true);
        setError("");

        if (!params.id) {
            setError("Invalid product ID");
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await updateProduct(params.id, data);
            if (result.success) {
                navigate("/dashboard/produk");
            } else {
                setError(result.error || "Failed to update product");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div class="max-w-5xl mx-auto">
            <Title>Edit Product | ElaApp</Title>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Edit Product</h1>
                <p class="text-slate-500 mt-2">Update product information.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                {error() && (
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error()}
                    </div>
                )}

                <Show when={product()} fallback={<Loading />}>
                    <ProductForm
                        initialData={product()}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting()}
                    />
                </Show>
            </div>
        </div>
    );
}
