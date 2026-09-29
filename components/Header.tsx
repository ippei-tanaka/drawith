import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import { getUser } from "@/lib/auth/actions";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="header-topbar">
      <div className="header-inner">
        <Link className="header-brand" href="/" aria-label="Drawith home">
          Drawith
        </Link>
        <HeaderMenu loggedIn={!!user} />
      </div>
    </header>
  );
}
