import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Progressive CSS decoration: content stays visible if JS or scroll timelines fail.
export function Reveal({ children, className, direction = "up" }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  return <div className={cn("reveal", `reveal-${direction}`, className)}>{children}</div>;
}
