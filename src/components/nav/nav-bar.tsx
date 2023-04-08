import Image from "next/image";
import Link from "next/link";
import UserNav from "./user-nav";

function NavBar({ title }: { title?: string }) {
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

      <div className="z-10">
        <div>
          {/* User Navigation */}
          <UserNav />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
