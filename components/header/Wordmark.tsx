import Link from 'next/link';
import LogoStar, { type LogoMode } from '@/components/LogoStar';

// The logo + wordmark, shared by the standalone AppHeader (other routes) and
// the generator's own top bar (home). Hover uses the accent variable, so it
// tints indigo/teal with the active mode on the generator; the logo icon flips
// to the teal images star when `mode` is passed (home only).
export default function Wordmark({ mode = 'geometry' }: { mode?: LogoMode }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[#111827] hover:text-[var(--nsg-accent)] transition-colors shrink-0"
    >
      <LogoStar mode={mode} />
      <span className="hidden sm:inline text-[13px] font-semibold tracking-tight">ninestar.app</span>
    </Link>
  );
}
