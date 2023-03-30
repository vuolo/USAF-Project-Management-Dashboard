import { type ReactNode } from "react";
import NavBar from "./nav-bar";
import SideBarNav from "~/components/projects/sidebar/sidebar-nav";

interface Props {
  children: ReactNode;
}

function Layout({ children }: Props) {
  return (
    <>
      <NavBar />
      <div className="flex w-screen relative">
        <SideBarNav/>
        <div className="ml-[75px] mr-0 flex overflow-hidden">{children}</div>
      </div>
    </>
  );
}

export default Layout;
