"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { BankProvider, useBank } from "./lib/useBank";
import { useAudio } from "./lib/useAudio";
import SignupView from "./components/SignupView";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";

// Dynamically import the 3D scene (no SSR — needs WebGL)
const Scene3D = dynamic(() => import("./components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-xs font-mono text-[rgba(232,236,244,0.3)] tracking-[0.2em]">
        INITIALIZING 3D ENGINE...
      </div>
    </div>
  ),
});

/**
 * Main banking interface component connected to BankContext.
 */
function NexusBankApp() {
  const bank = useBank();
  const audio = useAudio();

  // Particle assembly progress for signup (0-1)
  const [assembleProgress, setAssembleProgress] = useState(0);

  const handleDepositChange = useCallback((val) => {
    const num = Number(val) || 0;
    const progress = Math.min(1, 1 - Math.exp(-num / 15000));
    setAssembleProgress(progress);
  }, []);

  return (
    <main suppressHydrationWarning className="relative w-full h-screen overflow-hidden bg-[#0B0F19]">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(11,15,25,0.7) 100%)",
        }}
      />

      {/* 3D Canvas (always present) */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-mono text-[rgba(232,236,244,0.3)] tracking-[0.2em]">
              LOADING...
            </div>
          </div>
        }
      >
        <Scene3D
          phase={bank.phase}
          assembleProgress={assembleProgress}
          lastAction={bank.lastAction}
          balance={bank.balance}
        />
      </Suspense>

      {/* Phase Views (overlaid on the canvas) */}
      <AnimatePresence mode="wait">
        {bank.phase === "signup" && (
          <SignupView
            key="signup"
            onCreateAccount={bank.createAccount}
            onDepositChange={handleDepositChange}
            playClick={audio.playClick}
            playSuccess={audio.playSuccess}
            playError={audio.playError}
          />
        )}

        {(bank.phase === "login" || bank.phase === "blocked") && (
          <LoginView
            key="login"
            onVerifyPin={bank.verifyPin}
            attempts={bank.attempts}
            maxAttempts={bank.MAX_PIN_ATTEMPTS}
            loginError={bank.loginError}
            isBlocked={bank.phase === "blocked"}
            accountName={bank.accountName}
            playClick={audio.playClick}
            playSuccess={audio.playSuccess}
            playError={audio.playError}
            playCritical={audio.playCritical}
          />
        )}

        {bank.phase === "dashboard" && (
          <DashboardView
            key="dashboard"
            accountName={bank.accountName}
            balance={bank.balance}
            transactions={bank.transactions}
            lastAction={bank.lastAction}
            onCheckBalance={bank.checkBalance}
            onDeposit={bank.deposit}
            onWithdraw={bank.withdraw}
            onLockWallet={bank.lockWallet}
            onLogout={bank.logout}
            playClick={audio.playClick}
            playSuccess={audio.playSuccess}
            playError={audio.playError}
            playDeposit={audio.playDeposit}
            playWithdraw={audio.playWithdraw}
            playCritical={audio.playCritical}
          />
        )}
      </AnimatePresence>

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] z-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,242,254,0.03) 2px, rgba(0,242,254,0.03) 4px)",
        }}
      />
    </main>
  );
}

/**
 * Root Home component wrapped in BankProvider with hydration guard.
 */
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main suppressHydrationWarning className="relative w-full h-screen overflow-hidden bg-[#0B0F19]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs font-mono text-[rgba(232,236,244,0.4)] tracking-[0.25em] animate-pulse">
            INITIALIZING NEXUS SPATIAL BANKING...
          </div>
        </div>
      </main>
    );
  }

  return (
    <BankProvider>
      <NexusBankApp />
    </BankProvider>
  );
}
