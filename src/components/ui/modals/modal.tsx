import { Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../button";
import { Loader2Icon } from "lucide-react";
import { classNames } from "~/utils/misc";

interface ModalProps {
  title: string;
  message: string;
  color: string;
  Icon: React.ElementType;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit?: () => void;
  submitButtonContent?: string;
  cancelButtonContent?: string;
  isLoading?: boolean;
  loadingButtonContent?: string;
  iconColor: string;
  hoverColor: string;
  lightColor: string;
  objectName?: string;
  customContents?: React.ReactNode;
  hideSubmitButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  setIsOpen,
  color,
  title,
  message,
  Icon = ExclamationTriangleIcon,
  submitButtonContent = "Submit",
  cancelButtonContent = "Cancel",
  onSubmit = () => {
    /* no onSubmit */
  },
  isLoading,
  loadingButtonContent,
  iconColor,
  hoverColor,
  lightColor,
  objectName,
  customContents,
  hideSubmitButton,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[3000] overflow-y-auto"
        onClose={setIsOpen}
        initialFocus={closeButtonRef}
      >
        <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-white pt-5 text-left align-bottom shadow-xl transition-all sm:w-full sm:max-w-lg sm:pt-6 sm:align-middle">
              <div className="absolute right-0 top-0 hidden px-4 pr-4 pt-4 sm:block sm:px-6">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                  onClick={() => setIsOpen(false)}
                  ref={closeButtonRef}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="px-4 sm:flex sm:items-start sm:px-6">
                <div
                  className={classNames(
                    "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
                    lightColor
                  )}
                >
                  <Icon
                    className={classNames("h-6 w-6", iconColor)}
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {title}
                    {objectName &&
                      (objectName === "Untitled" ? (
                        <p className="inline">
                          {" ("}
                          <span className="italic">Untitled</span>
                          {")"}
                        </p>
                      ) : (
                        ` (${objectName})`
                      ))}
                  </Dialog.Title>
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>

              {/* Custom Contents */}
              <div className="px-4 sm:px-6">{customContents}</div>

              {/* Footer */}
              <div className="mt-4 bg-gray-100 px-4 py-4 sm:flex sm:justify-end">
                {/* Cancel Button */}
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {cancelButtonContent}
                </button>

                {/* Submit Button */}
                {!hideSubmitButton && (
                  <Button
                    text={
                      isLoading
                        ? loadingButtonContent ?? submitButtonContent
                        : submitButtonContent
                    }
                    type="button"
                    icon={isLoading ? Loader2Icon : undefined}
                    iconClassName={isLoading ? "animate-spin" : undefined}
                    disabled={isLoading}
                    className={classNames(
                      "w-full sm:ml-3 sm:w-fit",
                      hoverColor,
                      color
                    )}
                    onClick={onSubmit}
                  />
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
