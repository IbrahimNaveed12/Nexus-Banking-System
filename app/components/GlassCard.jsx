"use client";

import { motion } from "framer-motion";

/**
 * Glassmorphic card component with gradient border and float animation.
 */
export default function GlassCard({
  children,
  className = "",
  glow = "",
  animate = true,
  ...props
}) {
  const glowClass =
    glow === "cyan"
      ? "glow-cyan"
      : glow === "violet"
      ? "glow-violet"
      : glow === "red"
      ? "glow-red"
      : "";

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 30, scale: 0.96 } : false}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : false}
      exit={animate ? { opacity: 0, y: -20, scale: 0.96 } : undefined}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`glass gradient-border backdrop-blur-xl bg-slate-950/40 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
