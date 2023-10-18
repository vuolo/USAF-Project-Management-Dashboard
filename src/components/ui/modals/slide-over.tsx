import { Fragment, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";

interface SlideOverProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  width?: string;
}

const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
  width,
}) => {
  return (
    // TODO: make the initial focus on the first input (not the current intial focus on the close button)
    // TODO: make the close animation/transition super fast but make the open animation/transition slower (but still quick)
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[201] overflow-hidden"
        onClose={setIsOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div
            className={classNames(
              "pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16",
              width ?? ""
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-2xl">
                <div className="flex h-full flex-col overflow-y-scroll border border-[#CCCCCC] bg-white shadow-xl">
                  <div className="flex-1">
                    <div className="border-b border-[#CCCCCC] bg-gray-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            {title}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500">{description}</p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-lg text-gray-500 hover:text-gray-600"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">{children}</div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SlideOver;
