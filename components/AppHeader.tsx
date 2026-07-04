import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TopBar from "@/components/header/TopBar";
import Wordmark from "@/components/header/Wordmark";
import HeaderNav from "@/components/header/HeaderNav";

// The standalone site header used on non-home routes (/about, /gallery, …).
// Same shell as the home top bar; the mode switch + document actions don't apply
// here, so the right side is a single "Open editor" CTA back to the generator.
export default function AppHeader() {
  return (
    <TopBar>
      <Wordmark />
      <div className="ml-4">
        <HeaderNav />
      </div>
      <Link
        href="/"
        className="ml-auto flex items-center gap-1.5 px-3 h-8 lg:h-9 rounded-lg text-[12px] lg:text-[13px] font-semibold text-white bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] transition-colors"
      >
        Open editor
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </TopBar>
  );
}
