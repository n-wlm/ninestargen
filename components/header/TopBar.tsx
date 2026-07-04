// The shared top-bar shell — one height/border/padding for the home generator
// bar and the standalone AppHeader (other routes), so they read as one system.
// Taller on desktop so the primary actions have room to breathe.
export default function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className="h-12 lg:h-14 flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 lg:px-5 border-b border-[#EAECF0] bg-white shrink-0">
      {children}
    </header>
  );
}
