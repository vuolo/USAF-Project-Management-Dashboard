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
  LightbulbIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function SidebarNav() {
  const { collapsed, collapseSidebar } = useProSidebar();
  const user = useSession().data?.db_user;
  const route = usePathname();

  return (
    <>
      <div
        className="invisible absolute hidden sm:visible sm:block"
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
          style={{ height: "100%", borderRightColor: "rgb(156 163 175 / 1)" }}
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
                <div className="mb-2 ml-4 mt-2 font-semibold leading-5 tracking-wider text-[#1C1C1C]">
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

                <Link href={"/insights"}>
                  <MenuItem
                    id={route == "/insights" ? "selected-menu-item" : ""}
                    style={{
                      boxShadow:
                        "inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)",
                    }}
                    className={
                      route == "/insights"
                        ? "border-blue-600 bg-blue-100 text-blue-600"
                        : ""
                    }
                    icon={<LightbulbIcon />}
                  >
                    Insights
                  </MenuItem>
                </Link>

                <div className="mb-2 ml-4 mt-2 font-semibold leading-5 tracking-wide text-[#1C1C1C]">
                  {collapsed ? (
                    <div className="flex w-full items-center justify-center pr-3.5">
                      <h1 className="opacity-60">•</h1>
                    </div>
                  ) : (
                    <h1>Projects</h1>
                  )}
                </div>

                <Link
                  href={
                    route !== "/" ? "/?section=projects" : "?section=projects"
                  }
                >
                  <MenuItem icon={<FoldersIcon />}>All Projects</MenuItem>
                </Link>

                <Link
                  href={
                    route !== "/" ? "/?section=favorites" : "?section=favorites"
                  }
                >
                  <MenuItem icon={<FolderHeartIcon />}>Favorites</MenuItem>
                </Link>

                <Link
                  href={
                    route !== "/"
                      ? "/?section=most-visited"
                      : "?section=most-visited"
                  }
                >
                  <MenuItem icon={<FolderClockIcon />}>
                    Recently Visited
                  </MenuItem>
                </Link>

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

      {/* horizontal nav bar for screens < "sm" */}
      <div className="flex h-14 items-center justify-around bg-white sm:hidden">
        <Link href={"/"}>
          <div
            className={
              route == "/"
                ? "border-b-2 border-blue-600 p-2 text-blue-600"
                : "p-2"
            }
          >
            <HomeIcon />
            {/* <span>Dashboard</span> */}
          </div>
        </Link>
        <Link href={"/dependencies"}>
          <div
            className={
              route == "/dependencies"
                ? "border-b-2 border-blue-600 p-2 text-blue-600"
                : "p-2"
            }
          >
            <ClipboardListIcon />
            {/* <span>Dependencies</span> */}
          </div>
        </Link>
        <Link href={"/insights"}>
          <div
            className={
              route == "/insights"
                ? "border-b-2 border-blue-600 p-2 text-blue-600"
                : "p-2"
            }
          >
            <LightbulbIcon />
            {/* <span>Insights</span> */}
          </div>
        </Link>
        {user?.user_role === "Admin" && (
          <Link href={"/admin"}>
            <div
              className={
                route == "/admin"
                  ? "border-b-2 border-blue-600 p-2 text-blue-600"
                  : "p-2"
              }
            >
              <CogIcon />
              {/* <span>Admin Settings</span> */}
            </div>
          </Link>
        )}
      </div>
    </>
  );
}

export default SidebarNav;
