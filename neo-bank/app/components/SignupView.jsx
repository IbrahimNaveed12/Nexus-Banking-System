"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import FloatingInput from "./FloatingInput";
import NeonButton from "./NeonButton";

/**
 * Phase 1 — Account Creation / Signup View
 * Floating holographic onboarding card with particle assembly in background.
 */
export default function SignupView({ onCreateAccount, onDepositChange, playClick, playSuccess, playError }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [deposit, setDeposit] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0); // 0=name, 1=pin, 2=deposit

  const handleSubmit = () => {
    // Validate PIN match
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      playError?.();
      return;
    }

    const result = onCreateAccount(name, pin, deposit || "0");
    if (result.success) {
      playSuccess?.();
    } else {
      setError(result.message);
      playError?.();
    }
  };

  const nextStep = () => {
    if (step === 0 && !name.trim()) {
      setError("Please enter your name.");
      playError?.();
      return;
    }
    if (step === 1) {
      if (!/^\d{4}$/.test(pin)) {
        setError("PIN must be exactly 4 digits.");
        playError?.();
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match.");
        playError?.();
        return;
      }
    }
    setError("");
    playClick?.();
    setStep((s) => Math.min(s + 1, 2));
  };

  const handlePinChange = (val) => {
    const filtered = val.replace(/\D/g, "").slice(0, 4);
    setPin(filtered);
    playClick?.();
  };

  const handleConfirmPinChange = (val) => {
    const filtered = val.replace(/\D/g, "").slice(0, 4);
    setConfirmPin(filtered);
    playClick?.();
  };

  const handleDepositChange = (val) => {
    const filtered = val.replace(/\D/g, "");
    setDeposit(filtered);
    onDepositChange?.(filtered);
    playClick?.();
  };

  const steps = [
    { title: "Identity", subtitle: "Who are you?" },
    { title: "Security", subtitle: "Set your 4-digit PIN" },
    { title: "Initialize", subtitle: "Starting balance" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <GlassCard
        glow="cyan"
        className="w-full max-w-md mx-4 p-8 pointer-events-auto animate-float"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse-glow" />
            <span className="text-xs font-mono tracking-[0.2em] text-[rgba(232,236,244,0.5)] uppercase">
              NEXUS · Account Creation
            </span>
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text mb-1">
            Create Your Account
          </h1>
          <p className="text-sm text-[rgba(232,236,244,0.4)]">
            {steps[step].subtitle}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                  i <= step
                    ? "bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] text-[#0B0F19]"
                    : "bg-[rgba(255,255,255,0.05)] text-[rgba(232,236,244,0.3)]"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 transition-all duration-500 ${
                    i < step ? "bg-[#00F2FE]" : "bg-[rgba(255,255,255,0.06)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-5 mb-6">
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FloatingInput
                id="signup-name"
                label="Account Holder Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                onFocus={() => playClick?.()}
                autoFocus
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FloatingInput
                id="signup-pin"
                label="Set 4-Digit PIN"
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                onFocus={() => playClick?.()}
                maxLength={4}
                inputMode="numeric"
                autoFocus
              />
              <FloatingInput
                id="signup-confirm-pin"
                label="Confirm PIN"
                type="password"
                value={confirmPin}
                onChange={(e) => handleConfirmPinChange(e.target.value)}
                onFocus={() => playClick?.()}
                maxLength={4}
                inputMode="numeric"
              />
              {/* PIN dot indicators */}
              <div className="flex justify-center gap-3 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`pin-dot ${i < pin.length ? "filled" : ""}`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FloatingInput
                id="signup-deposit"
                label="Initial Deposit Amount (₹)"
                value={deposit}
                onChange={(e) => handleDepositChange(e.target.value)}
                onFocus={() => playClick?.()}
                inputMode="numeric"
                autoFocus
              />
              <p className="text-xs text-[rgba(232,236,244,0.3)] mt-2 font-mono">
                Minimum: ₹0 · Enter your starting balance
              </p>
            </motion.div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[#FF3D71] mb-4 text-center font-mono"
          >
            {error}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <NeonButton
              id="signup-back"
              variant="ghost"
              onClick={() => {
                setStep((s) => s - 1);
                setError("");
                playClick?.();
              }}
              className="flex-1"
            >
              Back
            </NeonButton>
          )}
          {step < 2 ? (
            <NeonButton
              id="signup-next"
              variant="cyan"
              onClick={nextStep}
              className="flex-1"
            >
              Continue
            </NeonButton>
          ) : (
            <NeonButton
              id="signup-create"
              variant="cyan"
              onClick={handleSubmit}
              className="flex-1"
            >
              Create Account
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
