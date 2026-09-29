"use client";

import Link from "next/link";   
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeaderMenu({ loggedIn, userName }: { loggedIn: boolean; userName?: string }) {

    const [isOpen, setIsOpen] = useState(false);
    const initials = loggedIn
        ? (userName || "Your account")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((namePart) => namePart[0])
            .join("")
            .toUpperCase()
        : "DW";

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".header-menu")) {
                setIsOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("click", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("click", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []); 

    return (
        <div className="header-menu">
            <button
                aria-controls="header-navigation"
                aria-expanded={isOpen}
                aria-label={loggedIn ? `${userName || "Account"} menu` : "Open sign-in menu"}
                className="header-menu-toggle"
                onClick={() => setIsOpen((open) => !open)}
                type="button"
            >
                {initials}
            </button>
            {isOpen && (
                <nav className="header-menu-list" id="header-navigation" aria-label="Account navigation">
                    <div className="header-menu-heading">
                        <span className="header-menu-kicker">{loggedIn ? "Workspace" : "Welcome"}</span>
                        <strong>{loggedIn ? userName || "Your account" : "Drawith"}</strong>
                    </div>
                    <div className="header-menu-links">
                        {loggedIn && <Link href="/dashboard" onClick={() => setIsOpen(false)}><span className="header-menu-icon"><Image src="/drawing-on-board.svg" alt="Boards" width={16} height={16} /></span>Boards</Link>}
                        {loggedIn && <Link href="/profile" onClick={() => setIsOpen(false)}><span className="header-menu-icon"><Image src="/profile.svg" alt="Profile" width={16} height={16} /></span>Profile settings</Link>}
                        {!loggedIn && <Link href="/sign-in" onClick={() => setIsOpen(false)}>Sign in</Link>}
                    </div>
                    {loggedIn && <div className="header-menu-footer"><Link href="/sign-out" onClick={() => setIsOpen(false)}>Sign out</Link></div>}
                </nav>
            )}
        </div>
    );
}