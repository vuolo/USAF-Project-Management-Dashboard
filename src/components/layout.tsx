import { type ReactNode } from "react";
import NavBar from "./nav/nav-bar";
import SideBarNav from "~/components/nav/sidebar-nav";

interface Props {
  children: ReactNode;
}

function Layout({ children }: Props) {
  return (
    <>
      <NavBar />
      <div className="hidden sm:relative sm:flex sm:w-screen">
        <SideBarNav />
        <div className="ml-[75px] mr-0 flex overflow-hidden">{children}</div>
      </div>
      <div className="block sm:hidden">{children}</div>
    </>
  );
}

export default Layout;
