
import { auth } from "@/lib/auth/server";
import { cache } from "react";
import { headers } from "next/headers";

export const getUser = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session?.user ?? null;
});