"use server";

import { getEvent, setCookie, getCookie, deleteCookie } from "vinxi/http";
import { db } from "~/db";
import { sessions } from "~/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "session";

export async function getUser() {
    try {
        const event = getEvent();
        const sessionId = getCookie(event, SESSION_COOKIE_NAME);
        console.log(`[Session] getUser found cookie: ${sessionId ? "YES" : "NO"} (${sessionId})`);

        if (!sessionId) return null;

        const session = await db.query.sessions.findFirst({
            where: eq(sessions.id, sessionId),
        });

        if (!session) {
            console.log("[Session] Session not found in DB");
            return null;
        }

        if (session.expiresAt < new Date()) {
            console.log("[Session] Session expired");
            await logout(); // Cleanup
            return null;
        }

        return session.userId;
    } catch (error) {
        console.error("Error getting session cookie:", error);
        return null;
    }
}

export async function createUserSession(userId: string) {
    console.log(`[Session] Creating session for user: ${userId}`);
    try {
        const event = getEvent();
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

        await db.insert(sessions).values({
            id: sessionId,
            userId: userId,
            expiresAt: expiresAt
        });

        setCookie(event, SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
            sameSite: "lax",
        });
        console.log("[Session] Session created and cookie set");
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
}

export async function logout() {
    console.log("Logging out user...");
    try {
        const event = getEvent();
        const sessionId = getCookie(event, SESSION_COOKIE_NAME);

        if (sessionId) {
            await db.delete(sessions).where(eq(sessions.id, sessionId));
        }

        deleteCookie(event, SESSION_COOKIE_NAME, { path: "/" });
        console.log("Session cookie deleted.");
    } catch (error) {
        console.error("Error during logout:", error);
    }
    return { success: true };
}
