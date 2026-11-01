"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import FloatingInput from "./FloatingInput";
import NeonButton from "./NeonButton";
import TransactionLog from "./TransactionLog";

/**
 * Phase 3 — Main Dashboard
 * Spatial grid layout surrounding the 3D Wealth Sphere canvas.
 * Glass overlay cards for account info, balance, operations, and transaction history.
 *
 * Implements ATM.java core routines:
 * 1. Check Balance
 * 2. Deposit (strictly positive integer)
 * 3. Withdraw (strictly positive multiple of 500, balance >= amount)
 * 4. Lock Wallet / Exit
 */
export default function DashboardView({
  accountName,
  balance,
  transactions,
  lastAction,
  onCheckBalance,
  onDeposit,
  onWithdraw,
  onLockWallet,
  onLogout,
  playClick,
  playSuccess,
  playError,
  playDeposit,
  playWithdraw,
  playCritical,
}) {
  const [activeTab, setActiveTab] = useState(null); // "deposit" | "withdraw" | null
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error"|"warning", title, message }
  const [isTerminating, setIsTerminating] = useState(false);

  const clearFeedback = useCallback(() => {
    setTimeout(() => setFeedback(null), 3800);
  }, []);

  const handleCheckBalance = () => {
    playClick?.();
    onCheckBalance();
    setFeedback({
      type: "success",
      title: "Balance Inquiry",
      message: `Current Balance: ₹${balance.toLocaleString()}`,
    });
    clearFeedback();
  };

  // Deposit: Strict input verification (positive integer > 0)
  const handleDeposit = () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      playError?.();
      setFeedback({
        type: "warning",
        title: "Deposit Rule Violation",
        message: "Please enter an amount to deposit which is greater than ₹0.",
      });
      clearFeedback();
      return;
    }
    if (!Number.isInteger(num)) {
      playError?.();
      setFeedback({
        type: "warning",
        title: "Format Error",
        message: "Deposit amount must be a whole integer number.",
      });
      clearFeedback();
      return;
    }

    const result = onDeposit(amount);
    if (result.success) {
      playDeposit?.();
      setFeedback({
        type: "success",
        title: "Deposit Successful",
        message: result.message,
      });
      setAmount("");
    } else {
      playError?.();
      setFeedback({
        type: "error",
        title: "Deposit Failed",
        message: result.message,
      });
    }
    clearFeedback();
  };

  // Withdraw: Strict boundary verification (must be multiple of 500 & <= balance)
  const handleWithdraw = () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      playError?.();
      setFeedback({
        type: "warning",
        title: "Withdrawal Rule Violation",
        message: "Please enter a positive withdrawal amount.",
      });
      clearFeedback();
      return;
    }

    if (num % 500 !== 0) {
      playError?.();
      setFeedback({
        type: "warning",
        title: "Boundary Rule Check",
        message:
          "Withdrawal amounts must strictly be positive multiples of ₹500 (e.g. ₹500, ₹1,000, ₹1,500, ₹2,000).",
      });
      clearFeedback();
      return;
    }

    if (num > balance) {
      playError?.();
      setFeedback({
        type: "warning",
        title: "Insufficient Balance",
        message: `Requested ₹${num.toLocaleString()}, but your available balance is ₹${balance.toLocaleString()}.`,
      });
      clearFeedback();
      return;
    }

    const result = onWithdraw(amount);
    if (result.success) {
      playWithdraw?.();
      setFeedback({
        type: "success",
        title: "Withdrawal Successful",
        message: result.message,
      });
      setAmount("");
    } else {
      playError?.();
      setFeedback({
        type: "error",
        title: "Withdrawal Failed",
        message: result.message,
      });
    }
    clearFeedback();
  };

  const handleAmountChange = (val) => {
    const filtered = val.replace(/\D/g, "");
    setAmount(filtered);
  };

  // Session Termination (4. Exit / Lock Wallet)
  const handleLockWallet = () => {
    playCritical?.();
    setIsTerminating(true);
    setTimeout(() => {
      onLockWallet?.();
    }, 350);
  };

  const handleLogout = () => {
    playClick?.();
    setIsTerminating(true);
    setTimeout(() => {
      onLogout?.();
    }, 350);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isTerminating ? 0 : 1, scale: isTerminating ? 0.97 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-10 pointer-events-none"
    >
      {/* ─── Top Bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] flex items-center justify-center text-[#0B0F19] font-bold text-sm">
            N
          </div>
          <div>
            <div className="text-xs font-mono tracking-[0.15em] text-[rgba(232,236,244,0.4)] uppercase">
              NEXUS Banking
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="backdrop-blur-xl bg-slate-950/40 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-2xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse-glow" />
            <span className="text-xs font-mono text-[rgba(232,236,244,0.6)]">
              {accountName}
            </span>
          </div>

          <button
            id="btn-top-lock"
            onClick={handleLockWallet}
            title="Lock Session (Require PIN)"
            className="backdrop-blur-xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/10 hover:border-amber-400/40 text-[rgba(232,236,244,0.7)] hover:text-amber-400 rounded-2xl px-3.5 py-2 text-xs font-mono transition-all duration-200 flex items-center gap-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">Lock Wallet</span>
          </button>

          <button
            id="btn-top-exit"
            onClick={handleLogout}
            title="Exit / Terminate Session"
            className="backdrop-blur-xl bg-slate-950/40 hover:bg-red-950/40 border border-white/10 hover:border-red-500/40 text-[rgba(232,236,244,0.7)] hover:text-red-400 rounded-2xl px-3.5 py-2 text-xs font-mono transition-all duration-200 flex items-center gap-1.5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <span>⏻</span>
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </motion.div>

      {/* ─── Left Panel: Account Info + Balance ─── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-72 pointer-events-auto"
      >
        <GlassCard glow="cyan" className="p-6 mb-4" animate={false}>
          <div className="text-xs font-mono tracking-[0.15em] text-[rgba(232,236,244,0.4)] uppercase mb-1">
            Account Holder
          </div>
          <div className="text-lg font-semibold text-[#E8ECF4] mb-4">
            {accountName}
          </div>
          <div className="text-xs font-mono tracking-[0.15em] text-[rgba(232,236,244,0.4)] uppercase mb-1">
            Current Balance
          </div>
          <motion.div
            key={balance}
            initial={{ scale: 1.08, color: "#00F2FE" }}
            animate={{ scale: 1, color: "#E8ECF4" }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold font-mono"
          >
            ₹{balance.toLocaleString()}
          </motion.div>
        </GlassCard>

        {/* Quick Actions (ATM.java Core Functions: 1. Check, 2. Deposit, 3. Withdraw, 4. Lock / Exit) */}
        <div className="space-y-2">
          <NeonButton
            id="btn-check-balance"
            variant="ghost"
            onClick={handleCheckBalance}
            className="w-full text-left flex items-center gap-3 px-5"
          >
            <span className="text-lg">◎</span>
            <span>1. Check Balance</span>
          </NeonButton>

          <NeonButton
            id="btn-deposit-tab"
            variant={activeTab === "deposit" ? "cyan" : "ghost"}
            onClick={() => {
              setActiveTab(activeTab === "deposit" ? null : "deposit");
              setAmount("");
              setFeedback(null);
              playClick?.();
            }}
            className="w-full text-left flex items-center gap-3 px-5"
          >
            <span className="text-lg">↗</span>
            <span>2. Deposit</span>
          </NeonButton>

          <NeonButton
            id="btn-withdraw-tab"
            variant={activeTab === "withdraw" ? "violet" : "ghost"}
            onClick={() => {
              setActiveTab(activeTab === "withdraw" ? null : "withdraw");
              setAmount("");
              setFeedback(null);
              playClick?.();
            }}
            className="w-full text-left flex items-center gap-3 px-5"
          >
            <span className="text-lg">↙</span>
            <span>3. Withdraw</span>
          </NeonButton>

          <NeonButton
            id="btn-lock-session"
            variant="ghost"
            onClick={handleLockWallet}
            className="w-full text-left flex items-center gap-3 px-5 hover:border-amber-400/40 hover:text-amber-300"
          >
            <span className="text-lg">🔒</span>
            <span>4. Lock Wallet / Exit</span>
          </NeonButton>
        </div>
      </motion.div>

      {/* ─── Bottom Center: Operation Panel ─── */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto"
          >
            <GlassCard
              glow={activeTab === "deposit" ? "cyan" : "violet"}
              className="p-6"
              animate={false}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono tracking-[0.15em] text-[rgba(232,236,244,0.4)] uppercase">
                  {activeTab === "deposit" ? "2. Deposit Funds" : "3. Withdraw Funds"}
                </div>
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-xs font-mono text-[rgba(232,236,244,0.4)] hover:text-white transition-colors cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex gap-3">
                <FloatingInput
                  id={`input-${activeTab}-amount`}
                  label={
                    activeTab === "withdraw"
                      ? "Amount (multiple of ₹500)"
                      : "Amount (₹)"
                  }
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onFocus={() => playClick?.()}
                  inputMode="numeric"
                  className="flex-1"
                />
                <NeonButton
                  id={`btn-${activeTab}-confirm`}
                  variant={activeTab === "deposit" ? "cyan" : "violet"}
                  onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
                  disabled={!amount}
                  className="flex-shrink-0"
                >
                  {activeTab === "deposit" ? "Deposit" : "Withdraw"}
                </NeonButton>
              </div>

              {activeTab === "withdraw" && (
                <p className="text-[10px] text-amber-300/60 font-mono mt-2">
                  ℹ ATM Boundary Rule: Amount must be a positive multiple of ₹500
                </p>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Right Panel: Transaction History ─── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute right-6 top-20 bottom-6 w-72 pointer-events-auto"
      >
        <GlassCard glow="" className="p-5 h-full flex flex-col" animate={false}>
          <div className="text-xs font-mono tracking-[0.15em] text-[rgba(232,236,244,0.4)] uppercase mb-3 flex-shrink-0">
            Transaction History
          </div>
          <div className="flex-1 overflow-hidden">
            <TransactionLog transactions={transactions} />
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── High-Visibility Glassmorphic Warning Notification Overlay ─── */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 max-w-lg w-auto mx-4 backdrop-blur-2xl rounded-2xl px-6 py-4 pointer-events-auto z-50 border shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex items-start gap-4 ${
              feedback.type === "warning"
                ? "bg-slate-950/85 border-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.25)]"
                : feedback.type === "error"
                ? "bg-slate-950/85 border-red-500/50 shadow-[0_0_35px_rgba(255,61,113,0.25)]"
                : "bg-slate-950/85 border-cyan-400/50 shadow-[0_0_35px_rgba(0,242,254,0.25)]"
            }`}
          >
            <div className="text-2xl flex-shrink-0 mt-0.5">
              {feedback.type === "warning"
                ? "⚠️"
                : feedback.type === "error"
                ? "🚫"
                : "✨"}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <div
                className={`text-xs font-mono font-bold tracking-wider uppercase mb-0.5 ${
                  feedback.type === "warning"
                    ? "text-amber-400"
                    : feedback.type === "error"
                    ? "text-[#FF3D71]"
                    : "text-[#00F2FE]"
                }`}
              >
                {feedback.title || (feedback.type === "warning" ? "Rule Verification" : "Alert")}
              </div>
              <p className="text-sm font-sans text-slate-200 leading-snug">
                {feedback.message}
              </p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs font-mono p-1 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
