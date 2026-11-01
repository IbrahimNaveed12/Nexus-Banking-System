"use client";

import { motion } from "framer-motion";

/**
 * Neon-accented button with spring-physics hover animations,
 * scale-up effect, and intense backlit neon box-shadows.
 */
export default function NeonButton({
  children,
  onClick,
  variant = "cyan", // "cyan" | "violet" | "red" | "ghost"
  disabled = false,
  className = "",
  id,
  ...props
}) {
  const variants = {
    cyan: {
      bg: "bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]",
      text: "text-[#0B0F19]",
      shadow: "0 0 20px rgba(0,242,254,0.3), 0 0 60px rgba(0,242,254,0.15)",
      hoverShadow: "0 0 30px rgba(0,242,254,0.5), 0 0 80px rgba(0,242,254,0.25), 0 4px 40px rgba(0,242,254,0.2)",
    },
    violet: {
      bg: "bg-gradient-to-r from-[#4FACFE] to-[#7C3AED]",
      text: "text-white",
      shadow: "0 0 20px rgba(79,172,254,0.3), 0 0 60px rgba(79,172,254,0.15)",
      hoverShadow: "0 0 30px rgba(79,172,254,0.5), 0 0 80px rgba(79,172,254,0.25), 0 4px 40px rgba(124,58,237,0.2)",
    },
    red: {
      bg: "bg-gradient-to-r from-[#FF3D71] to-[#FF6B6B]",
      text: "text-white",
      shadow: "0 0 20px rgba(255,61,113,0.3), 0 0 60px rgba(255,61,113,0.15)",
      hoverShadow: "0 0 30px rgba(255,61,113,0.5), 0 0 80px rgba(255,61,113,0.25)",
    },
    ghost: {
      bg: "bg-transparent border border-[rgba(255,255,255,0.1)]",
      text: "text-[#E8ECF4]",
      shadow: "none",
      hoverShadow: "0 0 15px rgba(0,242,254,0.15)",
    },
  };

  const v = variants[variant] || variants.cyan;

  return (
    <motion.button
      id={id}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04, boxShadow: v.hoverShadow }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm tracking-wide
        cursor-pointer transition-all duration-200
        ${v.bg} ${v.text}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}
      `}
      style={{ boxShadow: disabled ? "none" : v.shadow }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
