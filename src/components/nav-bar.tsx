import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { Cog, Home, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";

function NavBar({ title }: { title?: string }) {
  const user = useSession().data?.db_user;

  return (
    <nav className="flex h-[70px] w-full items-center justify-between border-b border-black/10 bg-brand-dark px-8 sm:px-16">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <Image
          src="/images/brand/AirForceLogoWhite.png"
          alt="Air Force"
          width={50}
          height={50}
        />
        <h1 className="text-2xl tracking-wider text-white">METIS</h1>
      </Link>

      {title && (
        <h2 className="hidden text-2xl tracking-wide text-white sm:block">
          {title}
        </h2>
      )}

      <div className="flex items-center gap-4 text-white">
        {/* Admin Page */}
        {user?.user_role === "Admin" && (
          <>
            <Link
              href="/admin"
              data-tooltip-id="admin-tooltip"
              data-tooltip-content="Admin Page"
              className="hover:text-white/80"
            >
              <Cog />
            </Link>
            <Tooltip id="admin-tooltip" style={{ opacity: 80 }} />
          </>
        )}

        {/* Home */}
        <Link
          href="/"
          data-tooltip-id="home-tooltip"
          data-tooltip-content="Home"
          className="hover:text-white/80"
        >
          <Home />
        </Link>
        <Tooltip id="home-tooltip" style={{ opacity: 80 }} />

        {/* Sign Out */}
        <Link
          href="/api/auth/signout"
          data-tooltip-id="sign-out-tooltip"
          data-tooltip-content="Sign Out"
          className="hover:text-white/80"
        >
          <LogOut />
        </Link>
        <Tooltip id="sign-out-tooltip" style={{ opacity: 80 }} />
      </div>
    </nav>
  );
}

export default NavBar;
