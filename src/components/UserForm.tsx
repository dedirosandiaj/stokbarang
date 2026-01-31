
import { createSignal } from "solid-js";
import { User, NewUser } from "~/lib/users";
import { createUserSchema, updateUserSchema } from "~/lib/validations";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";

type UserFormProps = {
    initialData?: User;
    onSubmit: (data: NewUser) => Promise<void>;
    isSubmitting: boolean;
};

export default function UserForm(props: UserFormProps) {
    const isEditMode = !!props.initialData;

    const [username, setUsername] = createSignal(props.initialData?.username || "");
    const [password, setPassword] = createSignal("");
    const [role, setRole] = createSignal<string>(props.initialData?.role || "kasir");
    const [errors, setErrors] = createSignal<Record<string, string>>({});

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        const rawData = {
            username: username(),
            password: password(),
            role: role(),
        };

        const schema = isEditMode ? updateUserSchema : createUserSchema;
        const result = schema.safeParse(rawData);

        if (!result.success) {
            const flattened = result.error.flatten();
            const fieldErrors: Record<string, string> = {};
            Object.entries(flattened.fieldErrors).forEach(([key, msgs]) => {
                if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
            });
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        await props.onSubmit(result.data as NewUser);
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-8">
            <div class="grid grid-cols-1 gap-x-8 gap-y-6 max-w-2xl">
                <Input
                    label="Username"
                    value={username()}
                    onInput={(e) => setUsername(e.currentTarget.value)}
                    error={errors().username}
                    placeholder="e.g. john_doe"
                />

                <Input
                    label={`Password ${isEditMode ? "(Leave blank to keep unchanged)" : ""}`}
                    type="password"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    error={errors().password}
                    placeholder={isEditMode ? "••••••••" : "Enter password"}
                />

                <Select
                    label="Role"
                    value={role()}
                    onChange={(e) => setRole(e.currentTarget.value)}
                    error={errors().role}
                    options={[
                        { label: "Kasir", value: "kasir" },
                        { label: "Admin", value: "admin" }
                    ]}
                />
            </div>

            <div class="flex justify-start pt-6 border-t border-slate-100">
                <Button
                    type="submit"
                    isLoading={props.isSubmitting}
                    disabled={props.isSubmitting}
                >
                    {isEditMode ? "Update User" : "Create User"}
                </Button>
            </div>
        </form>
    );
}
