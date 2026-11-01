"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

const MAX_PIN_ATTEMPTS = 3;
const STORAGE_KEY = "nexus_bank_session_v1";

const BankContext = createContext(null);

export function BankProvider({ children }) {
  // ─── Account State ───
  const [accountName, setAccountName] = useState("");
  const [pin, setPin] = useState("");
  const [balance, setBalance] = useState(0);

  // ─── App Phase: "signup" | "login" | "dashboard" | "blocked" ───
  const [phase, setPhase] = useState("signup");

  // ─── Login State ───
  const [attempts, setAttempts] = useState(0);
  const [loginError, setLoginError] = useState("");

  // ─── Transaction State ───
  const [transactions, setTransactions] = useState([]);
  const [lastAction, setLastAction] = useState(null); // { type, amount, balance, success, message, timestamp }

  // Unique ID counter
  const txIdRef = useRef(1);
  const isHydrated = useRef(false);

  // ─── 1. State Persistence: Load from Session Storage on Mount ───
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.accountName && parsed.pin) {
            setAccountName(parsed.accountName);
            setPin(parsed.pin);
            setBalance(Number(parsed.balance) || 0);
            setTransactions(Array.isArray(parsed.transactions) ? parsed.transactions : []);
            txIdRef.current = (parsed.transactions?.length || 0) + 1;
            // Restore session phase (if was in dashboard, go to login for security lock, or maintain state)
            setPhase(parsed.phase === "dashboard" ? "login" : parsed.phase || "login");
            setAttempts(parsed.attempts || 0);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to restore banking session:", e);
    } finally {
      isHydrated.current = true;
    }
  }, []);

  // ─── Save State to Session Storage on Change ───
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      if (typeof window !== "undefined" && accountName) {
        const sessionPayload = {
          accountName,
          pin,
          balance,
          phase,
          transactions,
          attempts,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionPayload));
      }
    } catch (e) {
      console.warn("Failed to persist banking session:", e);
    }
  }, [accountName, pin, balance, phase, transactions, attempts]);

  // ─── Transaction Helper ───
  const addTransaction = useCallback((type, amount, newBalance, success, message) => {
    const tx = {
      id: txIdRef.current++,
      type,
      amount,
      balance: newBalance,
      success,
      message,
      timestamp: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    setLastAction(tx);
    return tx;
  }, []);

  // ─── Phase 1: Account Creation ───
  const createAccount = useCallback(
    (name, chosenPin, initialDeposit) => {
      const trimmedName = (name || "").trim();
      if (!trimmedName) {
        return { success: false, message: "Account name is required." };
      }

      if (!/^\d{4}$/.test(chosenPin)) {
        return { success: false, message: "PIN must be exactly 4 digits." };
      }

      const deposit = Number(initialDeposit);
      if (isNaN(deposit) || deposit < 0) {
        return { success: false, message: "Initial deposit must be 0 or greater." };
      }

      setAccountName(trimmedName);
      setPin(chosenPin);
      setBalance(deposit);
      setAttempts(0);
      setLoginError("");

      if (deposit > 0) {
        addTransaction(
          "INITIAL_DEPOSIT",
          deposit,
          deposit,
          true,
          "Account created with initial deposit"
        );
      }

      setPhase("login");
      return { success: true, message: "Account created successfully." };
    },
    [addTransaction]
  );

  // ─── Phase 2: PIN Authentication ───
  const verifyPin = useCallback(
    (enteredPin) => {
      if (phase === "blocked") {
        return {
          success: false,
          message: "Account is blocked. Maximum attempts reached.",
          blocked: true,
        };
      }

      if (enteredPin === pin) {
        setAttempts(0);
        setLoginError("");
        setPhase("dashboard");
        return { success: true, message: "PIN Accepted!" };
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        setPhase("blocked");
        setLoginError("Account Blocked! Maximum attempts reached.");
        return {
          success: false,
          message: "Account Blocked! Maximum attempts reached.",
          blocked: true,
        };
      }

      const remaining = MAX_PIN_ATTEMPTS - newAttempts;
      const msg = `Wrong PIN! Attempts left: ${remaining}`;
      setLoginError(msg);
      return { success: false, message: msg, blocked: false, remaining };
    },
    [phase, pin, attempts]
  );

  // ─── Phase 3: Dashboard Operations ───
  const checkBalance = useCallback(() => {
    const msg = `Current Balance: ₹${balance.toLocaleString()}`;
    const tx = {
      id: txIdRef.current++,
      type: "BALANCE_CHECK",
      amount: 0,
      balance,
      success: true,
      message: msg,
      timestamp: new Date().toISOString(),
    };
    setLastAction(tx);
    return balance;
  }, [balance]);

  // Deposit (must be strictly > 0 integer)
  const deposit = useCallback(
    (amount) => {
      const amt = Number(amount);

      if (isNaN(amt) || amt <= 0) {
        const msg = "Please enter an amount to deposit which is greater than 0.";
        addTransaction("DEPOSIT", isNaN(amt) ? 0 : amt, balance, false, msg);
        return { success: false, message: msg };
      }

      if (!Number.isInteger(amt)) {
        const msg = "Please enter a whole number amount.";
        addTransaction("DEPOSIT", amt, balance, false, msg);
        return { success: false, message: msg };
      }

      const newBalance = balance + amt;
      setBalance(newBalance);
      const msg = `₹${amt.toLocaleString()} deposited successfully. New balance: ₹${newBalance.toLocaleString()}`;
      addTransaction("DEPOSIT", amt, newBalance, true, msg);
      return { success: true, message: msg, newBalance };
    },
    [balance, addTransaction]
  );

  // Withdraw (must be strictly > 0, multiple of 500, balance >= amt)
  const withdraw = useCallback(
    (amount) => {
      const amt = Number(amount);

      if (isNaN(amt) || amt <= 0) {
        const msg = "Please enter a positive withdrawal amount.";
        addTransaction("WITHDRAWAL", isNaN(amt) ? 0 : amt, balance, false, msg);
        return { success: false, message: msg };
      }

      if (amt % 500 !== 0) {
        const msg = "Please enter a withdrawal amount which is a positive multiple of 500.";
        addTransaction("WITHDRAWAL", amt, balance, false, msg);
        return { success: false, message: msg };
      }

      if (balance < amt) {
        const msg = "Insufficient Balance.";
        addTransaction("WITHDRAWAL", amt, balance, false, msg);
        return { success: false, message: msg };
      }

      const newBalance = balance - amt;
      setBalance(newBalance);
      const msg = `₹${amt.toLocaleString()} withdrawn successfully. New balance: ₹${newBalance.toLocaleString()}`;
      addTransaction("WITHDRAWAL", amt, newBalance, true, msg);
      return { success: true, message: msg, newBalance };
    },
    [balance, addTransaction]
  );

  // ─── 3. Session Termination: Lock Wallet & Logout ───
  // Lock Wallet: locks the dashboard and transitions to the PIN authentication screen
  const lockWallet = useCallback(() => {
    setPhase("login");
    setLoginError("");
    setLastAction({
      type: "LOCK_WALLET",
      amount: 0,
      balance,
      success: true,
      message: "Session locked. Please re-authenticate.",
      timestamp: new Date().toISOString(),
    });
  }, [balance]);

  // Full Logout / Exit: clears session completely and resets to Signup
  const logout = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to clear session storage:", e);
    }
    setAccountName("");
    setPin("");
    setBalance(0);
    setTransactions([]);
    setLastAction(null);
    setAttempts(0);
    setLoginError("");
    setPhase("signup");
  }, []);

  const value = {
    // State
    phase,
    accountName,
    balance,
    attempts,
    loginError,
    transactions,
    lastAction,
    // Actions
    createAccount,
    verifyPin,
    checkBalance,
    deposit,
    withdraw,
    lockWallet,
    logout,
    // Constants
    MAX_PIN_ATTEMPTS,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBankContext() {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error("useBankContext must be used within a BankProvider");
  }
  return context;
}
