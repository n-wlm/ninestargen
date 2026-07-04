'use client';

import { memo } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import { Shapes, Images, type LucideIcon } from 'lucide-react';

export type Mode = 'geometry' | 'images';

const OPTIONS: { value: Mode; label: string; Icon: LucideIcon }[] = [
  { value: 'geometry', label: 'Geometry', Icon: Shapes },
  { value: 'images', label: 'Images', Icon: Images },
];

// The primary mode control, lifted into the header. The active pill is filled
// with the accent colour, which is itself overridden per mode (indigo for
// geometry, teal for images) — so the switch both shows and drives the theme.
// On narrow phones the text labels collapse to just the icons (with a
// comfortable tap target) so the switch never squeezes the header actions out.
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <LayoutGroup id="mode-switch">
      <div className="flex rounded-lg bg-[#EEF0F3] p-0.5 gap-0.5">
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              aria-label={label}
              title={label}
              className={`relative flex items-center justify-center gap-1.5 min-w-[40px] sm:min-w-0 px-3 sm:px-3.5 py-1.5 sm:py-1 text-[12px] font-semibold rounded-md transition-colors z-10 ${
                active ? 'text-white' : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mode-active"
                  className="absolute inset-0 rounded-md bg-[var(--nsg-accent)] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="w-4 h-4 sm:hidden shrink-0" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default memo(ModeSwitch);
