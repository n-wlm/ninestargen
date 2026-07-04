import Link from 'next/link';
import LogoStar from '@/components/LogoStar';

// The logo + wordmark, shared by the standalone AppHeader (other routes) and
// the generator's own top bar (home). Hover uses the accent variable, so it
// tints indigo/teal with the active mode on the generator.
export default function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[#111827] hover:text-[var(--nsg-accent)] transition-colors shrink-0"
    >
      <LogoStar />
      <span className="text-[13px] font-semibold tracking-tight">ninestar.app</span>
    </Link>
  );
}
