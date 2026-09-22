import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import { getUser } from "@/lib/auth/actions";
import "@/styles/components.css";

export default async function Header() 
{
    const user = await getUser(); 
    
    return (
        <header className="header-topbar">
            <Link className="header-brand" href="/" aria-label="Drawith home">
                <span className="header-brand-mark">D</span>
                <span>drawith</span>
            </Link>
            <HeaderMenu loggedIn={!!user} />
        </header>
    );
}