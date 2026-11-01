"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Scrolling transaction history log with animated entries.
 */
export default function TransactionLog({ transactions = [] }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case "DEPOSIT":
      case "INITIAL_DEPOSIT":
        return "↗";
      case "WITHDRAWAL":
        return "↙";
      case "BALANCE_CHECK":
        return "◎";
      default:
        return "•";
    }
  };

  const getTypeColor = (tx) => {
    if (!tx.success) return "text-[#FF3D71]";
    switch (tx.type) {
      case "DEPOSIT":
      case "INITIAL_DEPOSIT":
        return "text-[#00F2FE]";
      case "WITHDRAWAL":
        return "text-[#4FACFE]";
      default:
        return "text-[#E8ECF4]";
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[rgba(232,236,244,0.3)] text-sm font-mono">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-full pr-1" style={{ scrollbarGutter: "stable" }}>
      <AnimatePresence initial={false}>
        {transactions.map((tx, idx) => (
          <motion.div
            key={`${tx.id || "tx"}-${tx.timestamp || "time"}-${idx}`}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="tx-item"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`text-lg flex-shrink-0 ${getTypeColor(tx)}`}>
                  {getTypeIcon(tx.type)}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-wide text-[rgba(232,236,244,0.7)]">
                    {tx.type.replace("_", " ")}
                  </div>
                  <div className="text-[10px] text-[rgba(232,236,244,0.35)] font-mono mt-0.5">
                    {formatTime(tx.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-mono font-semibold ${getTypeColor(tx)}`}>
                  {tx.type === "WITHDRAWAL" && tx.success ? "−" : tx.type.includes("DEPOSIT") && tx.success ? "+" : ""}
                  {tx.amount > 0 ? `₹${tx.amount.toLocaleString()}` : ""}
                </div>
                <div className="text-[10px] text-[rgba(232,236,244,0.3)] font-mono">
                  Bal: ₹{tx.balance.toLocaleString()}
                </div>
              </div>
            </div>
            {!tx.success && (
              <div className="text-[10px] text-[#FF3D71] mt-1 font-mono opacity-80">
                {tx.message}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
