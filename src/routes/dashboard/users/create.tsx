import { useNavigate } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import { createUser, NewUser } from "~/lib/users";
import UserForm from "~/components/UserForm";

export default function CreateUser() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSubmit = async (data: NewUser) => {
        setIsSubmitting(true);
        setError("");

        try {
            const result = await createUser(data);
            if (result.success) {
                navigate("/dashboard/users");
            } else {
                setError(result.error || "Failed to create user");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div class="max-w-5xl mx-auto">
            <Title>Add User | ElaApp</Title>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Add User</h1>
                <p class="text-slate-500 mt-2">Create a new user account.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                {error() && (
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error()}
                    </div>
                )}

                <UserForm onSubmit={handleSubmit} isSubmitting={isSubmitting()} />
            </div>
        </div>
    );
}
