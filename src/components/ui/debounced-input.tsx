import {
  useState,
  useEffect,
  type FC,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { Icon } from "~/types/misc";
import Input from "./input";

interface DebouncedInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    "onChange"
  > {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  label?: string;
  optional?: boolean;
  icon?: Icon;
  register?: UseFormRegisterReturn<string>;
  descriptorComponent?: ReactNode;
  className?: string;
  variant?: "default" | "large";
  borderStyle?: "default" | "none";
  largeSize?: string;
  autoScaleHeight?: boolean;
  error?: string;
}

const DebouncedInput: FC<DebouncedInputProps> = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default DebouncedInput;
