'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

const POPOVER_WIDTH = 176; // matches w-44

// Shared control primitives used by both the geometry ControlPanel and the
// image-mode ImageControlPanel. Extracted so both panels stay visually identical.

// A text button that asks for a tiny inline confirmation before firing its action.
// Used for destructive resets so a stray click can't wipe everything.
export function ConfirmButton({
  label,
  message,
  confirmLabel,
  onConfirm,
  className,
  destructive,
  placement = 'bottom',
  align = 'right',
}: {
  label: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
  destructive?: boolean;
  placement?: 'top' | 'bottom';
  align?: 'right' | 'center'; // 'center' = centered under the trigger
}) {
  const [open, setOpen] = useState(false);
  // Fixed-position coords for the centered (portaled) variant, set on open.
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const t = e.target as Node;
      if (ref.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    if (align === 'center') {
      // Measure the trigger and centre the popover under it, in fixed coords so
      // it escapes the sidebar's overflow clipping. Clamp to the viewport so it
      // never runs off-screen (e.g. a right-edge trigger on mobile).
      const r = ref.current?.getBoundingClientRect();
      if (r) {
        const left = Math.min(
          Math.max(8, r.left + r.width / 2 - POPOVER_WIDTH / 2),
          window.innerWidth - POPOVER_WIDTH - 8,
        );
        setPos({ left, top: r.bottom + 6 });
      }
    }
    setOpen(true);
  }

  const body = (
    <>
      <p className="text-[11px] text-[#374151] leading-snug">{message}</p>
      <div className="flex gap-1.5">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 py-1 rounded-md text-[11px] font-medium bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
          className={`flex-1 py-1 rounded-md text-[11px] font-semibold text-white transition-colors ${
            destructive ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)]'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );

  const cardBase =
    'z-[70] w-44 bg-white rounded-lg shadow-lg border border-[#E5E7EB] p-2.5 flex flex-col gap-2';

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className={className}>
        {label}
      </button>

      {/* Right-aligned variant stays in-flow (used inside modals). */}
      {align !== 'center' && (
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popRef}
              className={`absolute right-0 ${cardBase} ${placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'}`}
              initial={{ opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === 'top' ? 4 : -4, scale: 0.97 }}
              transition={{ duration: 0.13, ease: 'easeOut' }}
            >
              {body}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Centered variant is portaled with fixed positioning to avoid clipping. */}
      {align === 'center' &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={popRef}
                style={{ position: 'fixed', left: pos.left, top: pos.top }}
                className={`fixed ${cardBase}`}
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.13, ease: 'easeOut' }}
              >
                {body}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#F3F4F6]">
      <div className="px-4 py-2.5 lg:py-2 bg-[#F9FAFB] border-b border-[#F3F4F6]">
        <p className="text-[12px] lg:text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">{title}</p>
      </div>
      <div className="px-4 py-4 lg:py-3 flex flex-col gap-4 lg:gap-3.5">{children}</div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-[#F3F4F6] p-0.5 gap-0.5">
      {options.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 py-2 lg:py-1 text-[13px] lg:text-[11px] rounded font-medium transition-all ${
            value === v
              ? 'bg-white text-[#111827] shadow-sm'
              : 'text-[#6B7280] hover:text-[#374151]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] lg:text-[11px] font-medium text-[#6B7280]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`rounded-full transition-all relative shrink-0 ${value ? 'bg-[var(--nsg-accent)]' : 'bg-[#D1D5DB]'}`}
        style={{ height: '18px', width: '32px' }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all"
          style={{ left: value ? '14px' : '2px' }}
        />
      </button>
    </div>
  );
}
