import React from "react";
import ReactDOM from "react-dom/client";
import { ProSidebarProvider } from "react-pro-sidebar";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import { ClipboardListIcon, FolderClockIcon, FolderHeartIcon, FolderPlusIcon, FoldersIcon, HomeIcon, CogIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation'
import { useSession } from "next-auth/react";



function App() {
  const { collapsed, collapseSidebar, toggleSidebar } = useProSidebar();
  const user = useSession().data?.db_user;
  const route = usePathname();

  
    return (
      <div id="app" className="hidden sm:block absolute" style={({ zIndex:"1",height:"100%",display:"flex", flexDirection:"column"})}>
        <Sidebar defaultCollapsed backgroundColor="white" transitionDuration={300} width="230px" collapsedWidth="75px" style={{ height: "100vh", borderRightColor:"rgb(156 163 175 / 1)"}}
          onMouseLeave={() => {
            collapseSidebar(true);
          }}
          onMouseEnter={() => {
            collapseSidebar(false);
          }}
        >
          <Menu menuItemStyles={{
            button: {
              '&:hover': {
                backgroundColor: 'gray-50',
              },
            },}}
            className="justify-items-start hover:[&_#selected-menu-item]:bg-indigo-200 h-full [&_ul]:h-full">      
            <div className="flex flex-col justify-between h-full">
            <div>
              <div className="leading-5 font-semibold ml-4 mt-2 mb-2">
                {collapsed ? <div className="w-full flex items-center justify-center pr-3.5">
                  <h1 className="opacity-60">•</h1>
                </div> : 
                  <h1 className="opacity-60">Overview</h1>}
              </div>
              <Link href={"/"}>
                <MenuItem id={route == "/" ? "selected-menu-item" : ""} style={{boxShadow:"inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)"}} className={route == "/" ? "bg-indigo-100 border-indigo-600 text-indigo-600"  : ""} icon={<HomeIcon />}>Dashboard</MenuItem>
              </Link>
              <Link href={"/dependencies"}>
                <MenuItem id={route == "/dependencies" ? "selected-menu-item" : ""} style={{boxShadow:"inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)"}} className={route == "/dependencies" ? "bg-indigo-100 border-indigo-600 text-indigo-600"  : ""} icon={<ClipboardListIcon />}>Dependencies</MenuItem>
              </Link>
              <div className="leading-5 font-semibold ml-4 mt-2 mb-2">
                {collapsed ? <div className="w-full flex items-center justify-center pr-3.5">
                  <h1 className="opacity-60">•</h1>
                </div> : 
                  <h1 className="opacity-60">Project</h1>}
              </div>
              {/* Disabled Icons, NO USE OF THEM YET */}
              <MenuItem disabled icon={<FoldersIcon />}>All Projects</MenuItem>
              <MenuItem disabled icon={<FolderHeartIcon />}>Favorites</MenuItem>
              <MenuItem disabled icon={<FolderClockIcon />}>Recently Visited</MenuItem>
              <Link  href={"/add-project"}>
                <MenuItem id={route == "/add-project" ? "selected-menu-item" : ""} style={{boxShadow:"inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)"}} className={route == "/add-project" ? "bg-indigo-100 border-indigo-600 text-indigo-600"  : ""} icon={<FolderPlusIcon />}>Add</MenuItem>
              </Link>
            </div>
            <div>
              {/* <div className="leading-5 font-semibold ml-4 mt-2 mb-2">
                {collapsed ? <div className="w-full flex items-center justify-center pr-3.5">
                  <h1 className="opacity-60">•</h1>
                </div> : 
                  <h1 className="opacity-60">Settings</h1>}
              </div> */}
              {route !== "/admin" && <div className="w-full h-[0.05rem] bg-gray-400"/>}
              {user?.user_role === "Admin" && (
                <Link href="/admin">
                  <MenuItem  id={route == "/admin" ? "selected-menu-item" : ""} style={{boxShadow:"inset 5px 0px rgb(79 70 229 / var(--tw-border-opacity)"}} className={route == "/admin" ? "bg-indigo-100 border-indigo-600 text-indigo-600"  : ""} icon={<CogIcon/>}>Admin Settings</MenuItem>
                </Link>
              )}
            </div>
            </div>
          </Menu>
        </Sidebar>
      </div>
    );
     
  }
  
  export default App;