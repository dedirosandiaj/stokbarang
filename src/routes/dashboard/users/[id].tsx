import { useNavigate, useParams, createAsync } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { updateUser, getUser, NewUser } from "~/lib/users";
import UserForm from "~/components/UserForm";

export default function EditUser() {
    const params = useParams();
    const navigate = useNavigate();


    // Fetch user data
    const user = createAsync(() => getUser(params.id));

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [error, setError] = createSignal("");

    const handleSubmit = async (data: NewUser) => {
        setIsSubmitting(true);
        setError("");

        try {
            // If password is empty string, we want to remove it so it doesn't update to empty string
            // But updateUser in lib handles empty check?
            // "if (updateData.password) { hash }"
            // Empty string is falsy, so it won't hash/update.
            // But we need to ensure we pass partial.

            const updatePayload: Partial<NewUser> = {
                username: data.username,
                role: data.role,
            };

            if (data.password) {
                updatePayload.password = data.password;
            }

            const result = await updateUser(params.id, updatePayload);
            if (result.success) {
                navigate("/dashboard/users");
            } else {
                setError(result.error || "Failed to update user");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div class="max-w-5xl mx-auto">
            <Title>Edit User | ElaApp</Title>

            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Edit User</h1>
                <p class="text-slate-500 mt-2">Update user account details.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                {error() && (
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error()}
                    </div>
                )}

                <Show when={user()} fallback={<div class="py-8 text-center text-slate-500">Loading user data...</div>}>
                    {(userData) => (
                        <UserForm
                            initialData={userData}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting()}
                        />
                    )}
                </Show>
            </div>
        </div>
    );
}
