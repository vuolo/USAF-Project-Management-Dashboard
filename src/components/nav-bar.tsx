import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { Cog, Home, UserIcon, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useRef, useState } from "react";
import {Menu, Transition} from "@headlessui/react"
function NavBar({ title }: { title?: string }) {
  const user = useSession().data?.db_user;

  const [open, setOpen] = useState(false);

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
        <div  
        // style={{ padding: "4px", marginTop:"4px", backgroundColor: "#bbb", borderRadius: "50%", display: "inline-block"}}
        >
        {/* Sign Out */}
          <Menu as="div" className="relative inline-block text-left">
        <div className="w-5 h-5 bg-[#d0d0d0] p-4 rounded-full flex justify-center items-center">
          <Menu.Button className="w-6 h-6">
          <UserIcon color="black" className="w-5 h-5"/>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 w-fit px-6 py-2 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ">
            <div className="flex gap-4">
              <div className="w-15 h-15 mt-1 bg-[#d0d0d0] p-3 rounded-full flex justify-center items-center">
                <UserIcon color="black"/>
              </div>
              <div className="flex flex-col">
                <h1 className="mt-1 font-serif font-bold">{user?.user_name}</h1>
                <p style={{fontSize:"15px"}} className="font-serif font-extralight">{user?.user_email}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Link href="/api/auth/signout">
              <div className="flex justify-center mt-4">
                <button className="w-full flex mb-1 h-8 justify-center items-center rounded-sm shadow-sm px-4 py-2 bg-[#d0d0d0] text-base font-bold text-black hover:bg-brand-light ">
                  {<LogOut size={18} strokeWidth={3} className="mr-1"/>}  Sign Out
                </button>
              </div>  
            </Link>
          </Menu.Items>
        </Transition>
      </Menu>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
