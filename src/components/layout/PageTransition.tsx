import type { ReactNode } from "react";

// Page content is visible in the server response, including without JavaScript.
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
