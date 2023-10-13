import React, {
  type ReactNode,
  type FC,
  type InputHTMLAttributes,
} from "react";
import { type UseFormRegisterReturn } from "react-hook-form";
import type { Icon } from "~/types/misc";
import { classNames } from "~/utils/misc";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  optional?: boolean;
  icon?: Icon;
  register?: UseFormRegisterReturn<string>;
  descriptorComponent?: ReactNode;
  className?: string;
  variant?: "default" | "large";
  borderStyle?: "default" | "none";
  appendedClassName?: string;
  largeSize?: string;
  autoScaleHeight?: boolean;
  error?: string;
  displayOnly?: boolean;
}

const Input: FC<InputProps> = ({
  label,
  optional,
  icon: Icon,
  register,
  descriptorComponent,
  className,
  variant = "default",
  borderStyle = "default",
  appendedClassName,
  largeSize,
  autoScaleHeight = false, // TODO: figure out how to make this work (see https://www.npmjs.com/package/react-textarea-autosize)
  error,
  displayOnly,
  ...props
}) => (
  <div className={className}>
    <div className="flex justify-between">
      {label && (
        <label
          htmlFor={props.name}
          className={classNames(
            "block text-sm",
            displayOnly ? "text-gray-500" : "font-medium text-black"
          )}
        >
          {label}
        </label>
      )}
      {(optional || descriptorComponent) && (
        <>
          {!label && <div />}
          {descriptorComponent ? (
            descriptorComponent
          ) : (
            <span
              className="text-sm text-gray-500"
              id={`${label?.toLocaleLowerCase() || "input"}-optional`}
            >
              Optional
            </span>
          )}
        </>
      )}
    </div>
    <div
      className={classNames(
        label ? "mt-1" : "",
        borderStyle === "none" ? "" : "shadow-sm",
        "relative rounded-md"
      )}
    >
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      {variant === "large" ? (
        <textarea
          autoComplete="off"
          className={classNames(
            "block w-full rounded-md placeholder-gray-400 sm:text-sm",
            Icon ? "pl-10" : "",
            largeSize ? largeSize : "min-h-[6rem]",
            displayOnly ? "-mt-2 font-medium text-black" : "",
            appendedClassName ?? "",
            borderStyle === "none"
              ? "border-none p-0 focus:ring-0"
              : "border-[#CCCCCC]"
          )}
          {...register}
          {...props}
        />
      ) : (
        <input
          autoComplete="off"
          className={classNames(
            "block w-full rounded-md placeholder-gray-400 sm:text-sm",
            Icon ? "pl-10" : "",
            displayOnly ? "-mt-2 font-medium text-black" : "",
            appendedClassName ?? "",
            borderStyle === "none"
              ? "border-none focus:ring-0"
              : "border-[#CCCCCC]"
          )}
          step={props.type === "number" ? "any" : undefined}
          {...register}
          {...props}
        />
      )}
      {error && (
        <p className="error-message mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  </div>
);

export default Input;
