"use server";
import { redirect } from "@solidjs/router";
import { getUser } from "~/lib/session";

export async function checkSession() {
    console.log("Checking session (Server Action)...");
    try {
        const userId = await getUser();
        console.log("User ID from session:", userId);

        if (userId) {
            console.log("Redirecting to dashboard");
            return "/dashboard";
        }
        console.log("Redirecting to login");
        return "/auth/login";
    } catch (err: any) {
        console.error("Error in checkSession:", err);
        return "/auth/login";
    }
}
