"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import NeonButton from "./NeonButton";

/**
 * Phase 2 — PIN Login Authentication
 * Glassmorphic biometric login pad with PIN dots.
 * 3 failed attempts triggers aggressive red alert + glass-shatter freeze.
 */
export default function LoginView({
  onVerifyPin,
  attempts,
  maxAttempts,
  loginError,
  isBlocked,
  accountName,
  playClick,
  playSuccess,
  playError,
  playCritical,
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [showShatter, setShowShatter] = useState(false);

  const handleDigit = useCallback(
    (digit) => {
      if (isBlocked || pin.length >= 4) return;
      playClick?.();
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => {
          const result = onVerifyPin(newPin);
          if (result.success) {
            playSuccess?.();
          } else if (result.blocked) {
            playCritical?.();
            setShowShatter(true);
          } else {
            playError?.();
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin("");
            }, 600);
          }
        }, 200);
      }
    },
    [pin, isBlocked, onVerifyPin, playClick, playSuccess, playError, playCritical]
  );

  const handleDelete = useCallback(() => {
    if (isBlocked) return;
    playClick?.();
    setPin((p) => p.slice(0, -1));
  }, [isBlocked, playClick]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      else if (e.key === "Backspace") handleDelete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDigit, handleDelete]);

  const keypadLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ];

  return (
    <>
      {/* Shatter / Blocked Overlay */}
      <AnimatePresence>
        {showShatter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="shatter-overlay flex items-center justify-center"
          >
            {/* Glass crack lines */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              {/* Generate crack pattern */}
              {Array.from({ length: 12 }).map((_, i) => {
                const cx = 500;
                const cy = 500;
                const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
                const len = 300 + Math.random() * 400;
                const ex = cx + Math.cos(angle) * len;
                const ey = cy + Math.sin(angle) * len;
                const mx = cx + Math.cos(angle + 0.2) * len * 0.5;
                const my = cy + Math.sin(angle - 0.1) * len * 0.5;
                return (
                  <motion.path
                    key={i}
                    d={`M${cx},${cy} Q${mx},${my} ${ex},${ey}`}
                    stroke="rgba(255,61,113,0.6)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                  />
                );
              })}
            </svg>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center"
            >
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-[#FF3D71] mb-2 text-glow-cyan" style={{ textShadow: "0 0 20px rgba(255,61,113,0.5)" }}>
                ACCOUNT BLOCKED
              </h2>
              <p className="text-sm text-[rgba(232,236,244,0.5)] font-mono">
                Maximum authentication attempts exceeded.
              </p>
              <p className="text-xs text-[rgba(232,236,244,0.3)] font-mono mt-2">
                Contact your administrator to unlock.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <GlassCard
          glow={attempts > 0 ? "red" : "violet"}
          className="w-full max-w-sm mx-4 p-8 pointer-events-auto"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-3"
            >
              <div className={`w-2 h-2 rounded-full ${attempts > 0 ? "bg-[#FF3D71]" : "bg-[#4FACFE]"} animate-pulse-glow`} />
              <span className="text-xs font-mono tracking-[0.2em] text-[rgba(232,236,244,0.5)] uppercase">
                Secure Authentication
              </span>
            </motion.div>
            <h1 className="text-xl font-bold text-[#E8ECF4] mb-1">
              Welcome back,{" "}
              <span className="gradient-text">{accountName}</span>
            </h1>
            <p className="text-sm text-[rgba(232,236,244,0.4)]">
              Enter your 4-digit PIN
            </p>
          </div>

          {/* PIN Dots */}
          <motion.div
            animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-4 mb-8"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={
                  i < pin.length
                    ? { scale: [1, 1.3, 1] }
                    : {}
                }
                transition={{ duration: 0.2 }}
                className={`pin-dot ${
                  i < pin.length
                    ? attempts > 0 && pin.length === 4
                      ? "error"
                      : "filled"
                    : ""
                }`}
              />
            ))}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[#FF3D71] text-center mb-4 font-mono"
              >
                {loginError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {keypadLayout.flat().map((key, i) => {
              if (key === "") return <div key={i} />;
              if (key === "⌫") {
                return (
                  <NeonButton
                    key={i}
                    id="login-delete"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isBlocked}
                    className="py-3.5 text-lg"
                  >
                    ⌫
                  </NeonButton>
                );
              }
              return (
                <NeonButton
                  key={i}
                  id={`login-key-${key}`}
                  variant="ghost"
                  onClick={() => handleDigit(key)}
                  disabled={isBlocked}
                  className="py-3.5 text-lg font-mono"
                >
                  {key}
                </NeonButton>
              );
            })}
          </div>

          {/* Attempt counter */}
          {attempts > 0 && !isBlocked && (
            <div className="mt-4 text-center">
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-1 rounded-full transition-all duration-300 ${
                      i < attempts ? "bg-[#FF3D71]" : "bg-[rgba(255,255,255,0.08)]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-[rgba(232,236,244,0.3)] font-mono mt-2">
                {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </>
  );
}
