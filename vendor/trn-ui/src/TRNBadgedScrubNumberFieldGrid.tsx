import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type TRNBadgedScrubNumberFieldGridProps = {
  columns?: 2 | 3;
  className?: string;
  children: ReactNode;
};

export function TRNBadgedScrubNumberFieldGrid(props: TRNBadgedScrubNumberFieldGridProps) {
  const { columns = 2, className, children } = props;
  const gridClass = columns === 3 ? "grid-cols-[repeat(3,minmax(0,1fr))]" : "grid-cols-[repeat(2,minmax(0,1fr))]";

  return <div className={twMerge("grid w-full min-w-0 gap-1.5", gridClass, className)}>{children}</div>;
}
