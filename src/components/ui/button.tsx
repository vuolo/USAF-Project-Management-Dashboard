import React, { type FC, type ButtonHTMLAttributes } from "react";
import type { Icon } from "~/types/misc";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: Icon;
  className?: string;
  variant?: "outline" | "solid";
  overrideClassName?: string;
  iconClassName?: string;
  iconClassDimensions?: string;
}

const Button: FC<ButtonProps> = ({
  text,
  icon: Icon,
  className,
  iconClassName,
  iconClassDimensions,
  overrideClassName,
  variant,
  ...props
}) => (
  <button
    type="button"
    className={classNames(
      overrideClassName ?? [
        "inline-flex h-fit w-fit items-center justify-center rounded-md py-2 text-sm font-medium shadow-sm",
        variant === "outline"
          ? "border border-brand-primary bg-white text-brand-primary hover:border-brand-primary_hover hover:bg-brand-primary hover:text-white"
          : "border border-transparent bg-brand-primary text-white hover:bg-brand-primary_hover",
        className ?? "",
        text ? "px-4" : "px-2",
        props.disabled
          ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
          : "",
      ]
    )}
    {...props}
  >
    {Icon && (
      <Icon
        className={classNames(
          iconClassDimensions ?? "h-5 w-5",
          iconClassName ?? "",
          text ? "-ml-1 mr-2" : ""
        )}
        aria-hidden="true"
      />
    )}
    {text}
  </button>
);

export default Button;
