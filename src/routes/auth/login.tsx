import { action, useSubmission } from "@solidjs/router";
import { createEffect } from "solid-js";
import Loading from "~/components/Loading";

const login = action(async (formData: FormData) => {
    "use server";
    const { db } = await import("~/db");
    const { users } = await import("~/db/schema");
    const { eq } = await import("drizzle-orm");
    const bcrypt = await import("bcryptjs");
    const { getEvent, setCookie } = await import("vinxi/http");
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));

    console.log(`Attempting login for: ${username}`);

    const user = await db.query.users.findFirst({
        where: eq(users.username, username),
    });

    if (!user) {
        console.log("User not found");
        throw new Error("Invalid username or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isValid}`);

    if (!isValid) {
        console.log("Invalid password");
        throw new Error("Invalid username or password");
    }

    const { createUserSession } = await import("~/lib/session");
    // ... validation logic ...

    console.log("Creating session...");
    await createUserSession(user.id);
    console.log("[Login] Session created. Returning success for client-side redirect.");

    // Return success - client will handle redirect
    return { success: true };
});

export default function Login() {
    const submission = useSubmission(login);

    // When login succeeds, do a FULL PAGE navigation to ensure cookies are applied
    createEffect(() => {
        if (submission.result?.success) {
            console.log("Login successful, performing full page navigation...");
            // Use full page reload navigation to ensure cookie is properly sent
            window.location.href = "/dashboard";
        }
    });

    return (
        <div class="flex items-center justify-center min-h-screen bg-gray-100">
            {submission.pending && <Loading />}
            <div class="p-8 bg-white rounded shadow-md w-96 relative">
                <h1 class="mb-6 text-2xl font-bold text-center">Login</h1>
                <form action={login} method="post" class="flex flex-col gap-4">
                    <div>
                        <label class="block mb-2 text-sm font-bold text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            class="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-bold text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            class="w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    {submission.error && (
                        <div class="text-red-500 text-sm font-bold text-center">
                            {submission.error.message}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={submission.pending}
                        class={`px-4 py-2 font-bold text-white rounded focus:outline-none focus:shadow-outline ${submission.pending
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-700"
                            }`}
                    >
                        {submission.pending ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
