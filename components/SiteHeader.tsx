"use client";

import { usePathname } from "next/navigation";
import AppHeader from "@/components/AppHeader";

// The home route ("/") renders its own top bar inside the generator (with the
// mode switch + document actions), so the standalone site header is suppressed
// there to avoid a double header. All other routes get the site header.
export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <AppHeader />;
}
