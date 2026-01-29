import type { ReactNode } from "react";
import Navigation from "@/components/layout/Navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="background-pattern" />
      <Navigation />
      {children}
    </>
  );
}
