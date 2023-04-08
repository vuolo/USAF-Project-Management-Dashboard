import Link from "next/link";
import { UserIcon, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

function UserNav() {
  const user = useSession().data?.db_user;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d0d0d0] p-1.5">
          <UserIcon color="#1C1C1C" />
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-fit origin-top-right divide-y divide-gray-100 rounded-md bg-white px-6 py-2 shadow-lg ">
          {/* User Information */}
          <div className="flex gap-4">
            <div className="w-15 h-15 mt-1 flex items-center justify-center rounded-full bg-[#d0d0d0] p-3">
              <UserIcon color="#1C1C1C" />
            </div>
            <div className="flex flex-col">
              <h1 className="mt-1 font-medium">
                {user?.user_name} ({user?.user_role})
              </h1>
              <p className="text-sm">{user?.user_email}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <Link href="/api/auth/signout">
            <div className="mt-4 flex justify-center">
              <button className="mb-1 flex h-8 w-full items-center justify-center rounded-sm bg-[#d0d0d0] px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-brand-light ">
                <LogOut size={16} strokeWidth={2} className="mr-2" />
                Sign Out
              </button>
            </div>
          </Link>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default UserNav;
