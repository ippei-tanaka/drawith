import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PATHS = ["/dashboard"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(pathname.startsWith("/dashboard"));

    if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Optimistic check only, cookie presence doesn't guarantee a valid session
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
            console.log(3);

        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
