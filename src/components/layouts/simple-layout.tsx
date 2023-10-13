import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { classNames } from "~/utils/misc";

export interface NavItem {
  id: string;
  name: string;
  href: string;
  current: boolean;
}

interface Props {
  mainContents: ReactNode;
  mainClassName?: string;
  modals?: ReactNode;
  variant?: "default" | "no-bg";
}

export default function SimpleLayout({
  mainContents,
  mainClassName,
  variant = "default",
  modals,
}: Props) {
  return (
    <main className="flex-1 sm:flex">
      {/* Main Content */}
      <section
        aria-labelledby="primary-heading"
        className="flex h-full flex-1 flex-col sm:order-last"
      >
        {/* Container */}
        <div
          className={classNames(
            "flex flex-1 flex-col overflow-y-auto",
            variant === "no-bg"
              ? "border-none bg-transparent shadow-none"
              : "m-4 rounded-md border border-[#CCCCCC] bg-white shadow-sm",
            mainClassName ?? ""
          )}
        >
          {mainContents}
        </div>
      </section>

      {/* Modals */}
      {modals}
    </main>
  );
}
