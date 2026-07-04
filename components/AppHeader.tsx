import Wordmark from "@/components/header/Wordmark";
import HeaderNav from "@/components/header/HeaderNav";

// The standalone site header used on non-home routes (/about, /gallery, …).
// On the home route the generator renders its own top bar (with the mode
// switch + actions) and this is suppressed by SiteHeader.
export default function AppHeader() {
  return (
    <header className="h-11 flex items-center px-5 border-b border-[#EAECF0] bg-white shrink-0">
      <Wordmark />
      <div className="ml-5">
        <HeaderNav />
      </div>
      <div className="ml-auto hidden sm:block">
        <span className="text-[11px] text-[#9CA3AF]">Free nine-pointed star creator</span>
      </div>
    </header>
  );
}
