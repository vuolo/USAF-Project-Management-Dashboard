import React, { type FC } from "react";
import { classNames } from "~/utils/misc";

interface TextSkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

const TextSkeleton: FC<TextSkeletonProps> = ({ height, width, className }) => (
  <div
    className={classNames(
      `animate-pulse rounded-full bg-gray-400`,
      className || ""
    )}
    style={{ height, width }}
  />
);

export default TextSkeleton;
