import React from "react";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import {
  ClipboardListIcon,
  FolderClockIcon,
  FolderHeartIcon,
  FolderPlusIcon,
  FoldersIcon,
  HomeIcon,
  CogIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function SidebarNav() {
  const { collapsed, collapseSidebar } = useProSidebar();
  const user = useSession().data?.db_user;
  const route = usePathname();

  return (
    <div
      className="absolute hidden sm:block"
      style={{
        zIndex: "1",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Sidebar
        defaultCollapsed
        backgroundColor="white"
        transitionDuration={300}
        width="230px"
        collapsedWidth="75px"
        style={{ height: "100vh", borderRightColor: "rgb(156 163 175 / 1)" }}
        onMouseLeave={() => {
          collapseSidebar(true);
        }}
        onMouseEnter={() => {
          collapseSidebar(false);
        }}
      >
        <Menu
          menuItemStyles={{
            button: {
              "&:hover": {
                backgroundColor: "gray-50",
              },
            },
          }}
          className="h-full justify-items-start [&_#selected-menu-item]:font-medium hover:[&_#selected-menu-item]:bg-blue-200 [&_ul]:h-full"
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="ml-4 mt-2 mb-2 font-semibold leading-5 tracking-wider text-[#1C1C1C]">
                {collapsed ? (
                  <div className="flex w-full items-center justify-center pr-3.5">
                    <h1 className="opacity-60">•</h1>
                  </div>
                ) : (
                  <h1>Overview</h1>
                )}
              </div>
              <Link href={"/"}>
                <MenuItem
                  id={route == "/" ? "selected-menu-item" : ""}
                  style={{
                    boxShadow:
                      "inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)",
                  }}
                  className={
                    route == "/"
                      ? "border-blue-600 bg-blue-100 text-blue-600"
                      : ""
                  }
                  icon={<HomeIcon />}
                >
                  Dashboard
                </MenuItem>
              </Link>
              <Link href={"/dependencies"}>
                <MenuItem
                  id={route == "/dependencies" ? "selected-menu-item" : ""}
                  style={{
                    boxShadow:
                      "inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)",
                  }}
                  className={
                    route == "/dependencies"
                      ? "border-blue-600 bg-blue-100 text-blue-600"
                      : ""
                  }
                  icon={<ClipboardListIcon />}
                >
                  Dependencies
                </MenuItem>
              </Link>
              <div className="ml-4 mt-2 mb-2 font-semibold leading-5 tracking-wide text-[#1C1C1C]">
                {collapsed ? (
                  <div className="flex w-full items-center justify-center pr-3.5">
                    <h1 className="opacity-60">•</h1>
                  </div>
                ) : (
                  <h1>Project</h1>
                )}
              </div>
              {/* Disabled Icons, NO USE OF THEM YET */}
              <MenuItem disabled icon={<FoldersIcon />}>
                All Projects
              </MenuItem>
              <MenuItem disabled icon={<FolderHeartIcon />}>
                Favorites
              </MenuItem>
              <MenuItem disabled icon={<FolderClockIcon />}>
                Recently Visited
              </MenuItem>
              <Link href={"/add-project"}>
                <MenuItem
                  id={route == "/add-project" ? "selected-menu-item" : ""}
                  style={{
                    boxShadow:
                      "inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)",
                  }}
                  className={
                    route == "/add-project"
                      ? "border-blue-600 bg-blue-100 text-blue-600"
                      : ""
                  }
                  icon={<FolderPlusIcon />}
                >
                  Add
                </MenuItem>
              </Link>
            </div>
            <div>
              {/* <div className="leading-5 font-semibold ml-4 mt-2 mb-2">
                {collapsed ? <div className="w-full flex items-center justify-center pr-3.5">
                  <h1 className="opacity-60">•</h1>
                </div> : 
                  <h1 className="opacity-60">Settings</h1>}
              </div> */}
              {route !== "/admin" && (
                <div className="h-[0.05rem] w-full bg-gray-400" />
              )}
              {user?.user_role === "Admin" && (
                <Link href="/admin">
                  <MenuItem
                    id={route == "/admin" ? "selected-menu-item" : ""}
                    style={{
                      boxShadow:
                        "inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)",
                    }}
                    className={
                      route == "/admin"
                        ? "border-blue-600 bg-blue-100 text-blue-600"
                        : ""
                    }
                    icon={<CogIcon />}
                  >
                    Admin Settings
                  </MenuItem>
                </Link>
              )}
            </div>
          </div>
        </Menu>
      </Sidebar>
    </div>
  );
}

export default SidebarNav;
