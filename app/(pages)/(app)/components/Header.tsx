import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import { getUser } from "../actions/auth";

export default async function Header() 
{
    const user = await getUser(); 
    
    return (
        <header className="header-topbar">
            <Link className="header-brand" href="/" aria-label="Drawith home">
                <span className="header-brand-mark">D</span>
                <span>drawith</span>
            </Link>
            {/* {user && <span className="header-user-name">Hello, {user.name}</span>} */}
            <span className="header-section-note">Live boards</span>
            <HeaderMenu loggedIn={!!user} />
        </header>
    );
}