"use client";

import { useCallback, useRef } from "react";

/**
 * Lightweight audio feedback system using Web Audio API.
 * Generates synthetic tones — no external audio files needed.
 */
export function useAudio() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Light electronic click — for input focus / button hover
  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }, [getCtx]);

  // Deep digital confirmation — for successful transactions
  const playSuccess = useCallback(() => {
    try {
      const ctx = getCtx();
      // Two-tone ascending chime
      [0, 0.1].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 0 ? 523 : 784, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.3);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.3);
      });
    } catch {}
  }, [getCtx]);

  // Warning buzzer — for errors / insufficient balance / wrong PIN
  const playError = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }, [getCtx]);

  // Critical alert — for account blocked
  const playCritical = useCallback(() => {
    try {
      const ctx = getCtx();
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + offset + 0.12);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.13);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.13);
      });
    } catch {}
  }, [getCtx]);

  // Deposit chime — bright ascending
  const playDeposit = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    } catch {}
  }, [getCtx]);

  // Withdrawal tone — descending
  const playWithdraw = useCallback(() => {
    try {
      const ctx = getCtx();
      [784, 523, 392].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch {}
  }, [getCtx]);

  return { playClick, playSuccess, playError, playCritical, playDeposit, playWithdraw };
}
