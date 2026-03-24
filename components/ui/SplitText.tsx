'use client';

import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number; // initial delay before stagger starts (seconds)
}

export default function SplitText({ text, className, wordClassName, delay = 0 }: SplitTextProps) {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={wordClassName}
          style={{ display: 'inline-block' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: delay + i * 0.08 }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}
