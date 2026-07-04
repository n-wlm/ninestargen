'use client';

import { memo } from 'react';
import { motion, LayoutGroup } from 'motion/react';

export type Mode = 'geometry' | 'images';

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'geometry', label: 'Geometry' },
  { value: 'images', label: 'Images' },
];

// The primary mode control, lifted into the header. The active pill is filled
// with the accent colour, which is itself overridden per mode (indigo for
// geometry, teal for images) — so the switch both shows and drives the theme.
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <LayoutGroup id="mode-switch">
      <div className="flex rounded-lg bg-[#EEF0F3] p-0.5 gap-0.5">
        {OPTIONS.map(({ value, label }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`relative px-3.5 py-1 text-[12px] font-semibold rounded-md transition-colors z-10 ${
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
              {label}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default memo(ModeSwitch);
