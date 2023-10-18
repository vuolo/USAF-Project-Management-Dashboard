import React, { type FC, type ButtonHTMLAttributes } from "react";
import { type NavItem } from "./layouts/simple-layout";
import { ChevronRightIcon } from "lucide-react";
import { classNames } from "~/utils/misc";
import TextSkeleton from "./ui/skeletons/text-skeleton";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  breadcrumbs: NavItem[];
  className?: string;
  isLoading?: boolean;
  customWidth?: string;
}

const Breadcrumbs: FC<ButtonProps> = ({
  breadcrumbs,
  className,
  isLoading,
  customWidth,
}) => (
  <nav
    aria-label="Breadcrumb"
    className={classNames(
      "no-scrollbar fixed -ml-1 flex h-fit max-h-6 overflow-auto rounded-sm bg-transparent py-1 pl-1",
      customWidth ?? "max-w-[40%] lg:max-w-[50%] xl:max-w-[60%]",
      className ?? "",
      isLoading ? "mt-3" : "mt-2"
    )}
  >
    <ol role="list" className="flex items-center space-x-2">
      {isLoading ? (
        <li>
          <div className="flex items-center space-x-2">
            <TextSkeleton
              width={"4rem"}
              height={"0.8rem"}
              className="rounded-md bg-gray-300 opacity-50"
            />
            <ChevronRightIcon
              className="h-3.5 w-3.5 flex-shrink-0 text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
              aria-hidden="true"
            />
            <TextSkeleton
              width={"5rem"}
              height={"0.8rem"}
              className="rounded-md bg-gray-400 opacity-90"
            />
          </div>
        </li>
      ) : (
        breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href}>
            <div className="flex items-center">
              {index !== 0 && (
                <ChevronRightIcon
                  className="h-3.5 w-3.5 flex-shrink-0 text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]"
                  aria-hidden="true"
                />
              )}
              <a
                href={breadcrumb.href}
                className={classNames(
                  index !== 0 ? "ml-2" : "",
                  "whitespace-nowrap rounded-sm text-xs font-medium [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]",
                  breadcrumb.current
                    ? "font-bold text-gray-100 hover:text-white hover:underline"
                    : "italic text-gray-300 hover:text-gray-100 hover:underline"
                )}
                aria-current={breadcrumb.current ? "page" : undefined}
              >
                {breadcrumb.name}
              </a>
            </div>
          </li>
        ))
      )}
    </ol>
  </nav>
);

export default Breadcrumbs;
