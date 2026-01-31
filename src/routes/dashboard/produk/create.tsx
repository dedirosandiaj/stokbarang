import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import { createProduct, NewProduct } from "~/lib/products";
import ProductForm from "~/components/ProductForm";

export default function CreateProduct() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSubmit = async (data: NewProduct) => {
        setIsSubmitting(true);
        setError("");

        try {
            const result = await createProduct(data);
            if (result.success) {
                navigate("/dashboard/produk");
            } else {
                setError(result.error || "Failed to create product");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div class="max-w-5xl mx-auto">
            <Title>Add Product | ElaApp</Title>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Add Product</h1>
                <p class="text-slate-500 mt-2">Add a new item to your inventory.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                {error() && (
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error()}
                    </div>
                )}

                <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting()} />
            </div>
        </div>
    );
}
