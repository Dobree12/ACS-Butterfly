import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="background-pattern" />
      {children}
    </>
  );
}
