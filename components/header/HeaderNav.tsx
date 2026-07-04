"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import WhatsNewDialog from "@/components/WhatsNewDialog";
import AboutDialog from "@/components/AboutDialog";
import { hasUnseenChanges, markChangesSeen } from "@/lib/changelog";
import { compositionToParams } from "@/lib/url-params";
import { presetToComposition } from "@/lib/preset-normalization";
import type { Preset } from "@/lib/presets";

const TemplatesModal = dynamic(() => import("@/components/TemplatesModal"), {
  loading: () => null,
});

// App-level navigation shared by AppHeader (other routes) and the generator's
// top bar (home): Templates, About, What's new. Pathname-aware — on home it
// applies a preset in place via the `nsg:apply-preset` event the generator
// listens for; elsewhere it navigates to the encoded URL.
function HeaderNav() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [unseenChanges, setUnseenChanges] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  useEffect(() => {
    if (pathname !== "/") return;
    const rafId = window.requestAnimationFrame(() => {
      try {
        if (!localStorage.getItem("templates_seen")) setShowTemplates(true);
      } catch {
        /* localStorage unavailable */
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        // A true first visit has nothing "new" — and the templates modal
        // already opens; two attention-grabbers at once is one too many.
        if (
          !localStorage.getItem("nsg:version-seen") &&
          !localStorage.getItem("templates_seen")
        ) {
          markChangesSeen();
        } else {
          setUnseenChanges(hasUnseenChanges());
        }
      } catch {
        /* localStorage unavailable */
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const closeModal = useCallback(() => {
    try {
      localStorage.setItem("templates_seen", "1");
    } catch {
      /* localStorage unavailable */
    }
    setShowTemplates(false);
  }, []);

  const openWhatsNew = useCallback(() => {
    markChangesSeen();
    setUnseenChanges(false);
    setShowWhatsNew(true);
  }, []);

  const selectPreset = useCallback(
    (preset: Preset) => {
      const composition = presetToComposition(preset);
      const params = compositionToParams(composition).toString();

      if (pathname === "/") {
        window.dispatchEvent(
          new CustomEvent("nsg:apply-preset", { detail: composition }),
        );
        router.replace(params ? `/?${params}` : "/", { scroll: false });
      } else {
        router.push(params ? `/?${params}` : "/");
      }

      closeModal();
    },
    [closeModal, pathname, router],
  );

  const startFromScratch = useCallback(() => {
    router.push("/");
    closeModal();
  }, [closeModal, router]);

  const linkCls =
    "px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6] cursor-pointer";

  return (
    <>
      {/* Inline text nav — lg and up (below that the ⋯ menu, so tablet widths
          don't push the header actions into a second line) */}
      <nav className="hidden lg:flex items-center">
        <button onClick={() => setShowTemplates(true)} className={linkCls}>Templates</button>
        <button onClick={() => setShowAbout(true)} className={linkCls}>About</button>
        <button onClick={openWhatsNew} className={`relative ${linkCls}`}>
          What&apos;s new
          {unseenChanges && (
            <span aria-hidden="true" className="absolute top-0.5 right-1 w-[5px] h-[5px] rounded-full bg-[var(--nsg-accent)]" />
          )}
        </button>
      </nav>

      {/* Compact overflow menu — below lg */}
      <div className="relative lg:hidden" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="More"
          className="relative flex items-center justify-center w-8 h-8 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
          {unseenChanges && (
            <span aria-hidden="true" className="absolute top-1 right-1 w-[5px] h-[5px] rounded-full bg-[var(--nsg-accent)]" />
          )}
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden z-50 py-1">
            <button onClick={() => { setMenuOpen(false); setShowTemplates(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#374151] hover:bg-[#F9FAFB]">Templates</button>
            <button onClick={() => { setMenuOpen(false); setShowAbout(true); }} className="w-full text-left px-3 py-2 text-[13px] text-[#374151] hover:bg-[#F9FAFB]">About</button>
            <button onClick={() => { setMenuOpen(false); openWhatsNew(); }} className="w-full text-left px-3 py-2 text-[13px] text-[#374151] hover:bg-[#F9FAFB] flex items-center justify-between">
              What&apos;s new
              {unseenChanges && <span aria-hidden="true" className="w-[5px] h-[5px] rounded-full bg-[var(--nsg-accent)]" />}
            </button>
          </div>
        )}
      </div>

      <TemplatesModal
        isOpen={showTemplates}
        onClose={closeModal}
        onSelectPreset={selectPreset}
        onStartFromScratch={startFromScratch}
      />

      <WhatsNewDialog open={showWhatsNew} onClose={() => setShowWhatsNew(false)} />

      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

export default memo(HeaderNav);
