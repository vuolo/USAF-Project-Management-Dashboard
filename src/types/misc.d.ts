import type { LucideIcon } from "lucide-react";

export type Icon =
  | React.ForwardRefExoticComponent<
      React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {
        title?: string;
        titleId?: string;
      } & React.RefAttributes<SVGSVGElement>
    >
  | LucideIcon;

// TODO: decide whether this is the final name and definition
export type DataRow = Record<string, unknown>;
