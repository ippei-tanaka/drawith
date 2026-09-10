"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeaderMenu({ loggedIn }: { loggedIn: boolean }) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="header-menu">
            <button
                aria-controls="header-navigation"
                aria-expanded={isOpen}
                aria-label="Toggle navigation menu"
                className="header-menu-toggle"
                onClick={() => setIsOpen((open) => !open)}
                type="button"
            >
                <span />
                <span />
                <span />
            </button>
            {isOpen && (
                <nav className="header-menu-list" id="header-navigation" aria-label="Account navigation">
                    {loggedIn && <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>}
                    {loggedIn && <Link href="/profile" onClick={() => setIsOpen(false)}>Profile</Link>}
                    {loggedIn && <Link href="/sign-out" onClick={() => setIsOpen(false)}>Sign Out</Link>}
                    {!loggedIn && <Link href="/sign-in" onClick={() => setIsOpen(false)}>Sign In</Link>}
                </nav>
            )}
        </div>
    );
}