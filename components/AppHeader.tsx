"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LogoStar from "@/components/LogoStar";
import { configToParams } from "@/lib/url-params";
import { normalizePresetConfig } from "@/lib/preset-normalization";
import type { Preset } from "@/lib/presets";

const TemplatesModal = dynamic(() => import("@/components/TemplatesModal"), {
  loading: () => null,
});

export default function AppHeader() {
  const [showTemplates, setShowTemplates] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const closeModal = useCallback(() => {
    try {
      localStorage.setItem("templates_seen", "1");
    } catch {
      /* localStorage unavailable */
    }
    setShowTemplates(false);
  }, []);

  const selectPreset = useCallback(
    (preset: Preset) => {
      const normalizedConfig = normalizePresetConfig(preset.config);
      const params = configToParams(normalizedConfig).toString();

      if (pathname === "/") {
        window.dispatchEvent(
          new CustomEvent("nsg:apply-preset", { detail: normalizedConfig }),
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

  return (
    <>
      <header className="h-11 flex items-center px-5 border-b border-[#EAECF0] bg-white shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#111827] hover:text-[#5E6AD2] transition-colors"
        >
          <LogoStar />
          <span className="text-[13px] font-semibold tracking-tight">
            ninestar.app
          </span>
        </Link>

        <nav className="flex items-center ml-5">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6] cursor-pointer"
          >
            Templates
          </button>
          <Link
            href="/about"
            className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6]"
          >
            About
          </Link>
        </nav>

        <div className="ml-auto hidden sm:block">
          <span className="text-[11px] text-[#9CA3AF]">
            Free nine-pointed star creator
          </span>
        </div>
      </header>

      <TemplatesModal
        isOpen={showTemplates}
        onClose={closeModal}
        onSelectPreset={selectPreset}
        onStartFromScratch={startFromScratch}
      />
    </>
  );
}
