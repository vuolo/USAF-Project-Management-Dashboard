import React, { type FC, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import type { Icon } from "~/types/misc";
import { classNames } from "~/utils/misc";
import { toastMessage } from "~/utils/toast";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";

interface DropdownItem {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  icon?: Icon;
}

export interface DropdownItemGroups {
  items: DropdownItem[];
}

interface DropdownProps {
  label?: string;
  itemGroups?: DropdownItemGroups[];
  direction?: "left" | "right";
}

const Dropdown: FC<DropdownProps> = ({
  label,
  itemGroups = [],
  direction = "left",
}) => (
  <Menu as="div" className="nodrag relative inline-block text-left">
    <div>
      {label ? (
        <Menu.Button className="inline-flex w-full justify-center rounded-md border border-[#CCCCCC] bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          {label}{" "}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      ) : (
        <Menu.Button className="flex items-center rounded-full text-black hover:text-gray-600">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          {/* <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" /> */}
        </Menu.Button>
      )}
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
      <Menu.Items
        className={classNames(
          "absolute z-[100] mt-2 w-56 divide-y divide-slate-200 rounded-md border border-[#CCCCCC] bg-white shadow-lg",
          direction === "right"
            ? "left-full -mx-6 origin-top-left"
            : "right-0 origin-top-right"
        )}
      >
        {itemGroups.map((itemGroup, groupIdx) => (
          <div key={groupIdx} className="py-1">
            {itemGroup.items.map((item, itemIdx) => (
              <Fragment key={itemIdx}>
                <Menu.Item
                  data-tooltip-id={
                    item.tooltip || item.disabled
                      ? `menu-item-tooltip-${itemIdx}`
                      : undefined
                  }
                  data-tooltip-content={
                    item.disabled
                      ? "This feature is not available yet. Please check back later."
                      : item.tooltip
                  }
                >
                  {({ active }) => (
                    <a
                      href="#"
                      onClick={
                        item.disabled
                          ? () => {
                              toast.info(
                                toastMessage(
                                  "This feature is not available yet",
                                  "We are working on it. Stay tuned!"
                                )
                              );
                            }
                          : item.onClick
                      }
                      className={`group flex items-center px-4 py-2 text-sm ${
                        item.disabled
                          ? "cursor-not-allowed text-gray-400"
                          : active
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className={classNames(
                            "mr-3 h-5 w-5 ",
                            item.disabled
                              ? "text-gray-300"
                              : "text-gray-400 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                      )}
                      {item.text}
                    </a>
                  )}
                </Menu.Item>
                {(item.tooltip || item.disabled) && (
                  <Tooltip
                    id={`menu-item-tooltip-${itemIdx}`}
                    className="z-10 max-w-sm whitespace-normal break-words text-center"
                  />
                )}
              </Fragment>
            ))}
          </div>
        ))}
      </Menu.Items>
    </Transition>
  </Menu>
);

export default Dropdown;
