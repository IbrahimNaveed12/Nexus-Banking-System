# 🌌 NEXUS · Spatial Neo-Banking Platform

> **An elite 3D WebGL Neo-Banking experience** built with **Next.js 16**, **React Three Fiber (R3F)**, **Three.js**, **Framer Motion**, and **Tailwind CSS v4**.  
> Adapts legacy banking core logic into a spatial, reactive financial dashboard featuring kinetic particle fields, interactive 3D assets, biometric PIN security, zero-asset Web Audio synthesis, and strict financial boundary enforcement.

---

## 🏛️ System Architecture Overview

```
                                  ┌────────────────────────┐
                                  │      Client Layer      │
                                  │  Next.js 16 App Router │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │     R3F / Three.js      │                     │   Glassmorphic UI/UX    │
         │     WebGL 3D Canvas     │                     │      Framer Motion      │
         ├─────────────────────────┤                     ├─────────────────────────┤
         │ • Kinetic Starfield     │                     │ • Signup / Onboarding   │
         │ • 1.5s Hyperdrive Warp  │◄─── State Events ───┤ • Keypad PIN Lock       │
         │ • Wealth Sphere Morph   │                     │ • Spatial Dashboard     │
         │ • Pointer Parallax      │                     │ • Rule Warning Overlays │
         └─────────────────────────┘                     └────────────┬────────────┘
                                                                      │
                                                                      ▼
                                                         ┌─────────────────────────┐
                                                         │   BankContext & State   │
                                                         ├─────────────────────────┤
                                                         │ • Session Persistence   │
                                                         │ • ATM Business Logic    │
                                                         │ • Web Audio Synthesizer │
                                                         └─────────────────────────┘
```

---

## ⚡ Core Features & Capabilities

### 1. 🪐 Kinetic 3D Backdrop Environment
- **Deep-Space Particle Field:** 1,200 depth-aware stars distributed across a wide $Z$-depth coordinate field ($-65$ to $+12$).
- **Orbital Drift & Math Noise:** Idle particles drift harmonically using continuous mathematical trigonometric noise calculated over `state.clock.getElapsedTime()` with individualized star velocity factors.
- **Transaction Hyper-Drive Warp:** Every deposit or withdrawal triggers an instantaneous $1.5\text{s}$ acceleration warp. Synchronized line-segment geometry stretches particles into cosmic financial speed-lines before smoothly decelerating (cubic ease-out curve) back to orbital drift.
- **Inverted Mouse Parallax:** Links normalized screen pointer coordinates (`state.pointer.x`, `state.pointer.y`) to an inverted target vector, creating physical separation between the glassmorphic foreground UI and deep space.

### 2. 🌐 Dynamic WealthSphere & Particle Assembly
- **Signup Assembly:** As the user enters their starting balance, scattered background particles dynamically coalesce into an icosahedral lattice.
- **Dynamic Balance Scaling:** On the dashboard, the central WealthSphere dynamically expands with positive deposits (accompanied by cyan energy waves) and contracts with withdrawals (violet particle dissolution).

### 3. 🛡️ Biometric PIN Authentication & Anti-Tamper Lockdown
- **Dynamic Session Instantiation:** Custom account holder name, custom 4-digit security PIN, and starting balance $\ge 0$.
- **Legacy Parity Security Routine:** Strictly enforces a maximum of **3 consecutive authentication attempts**.
- **SVG Glass-Shatter Lockdown:** On the 3rd failed attempt, the system triggers a red alert with SVG crack overlays, audio distortion buzzers, and permanently freezes interface interaction.

### 4. ⚖️ Strict Financial Boundary Verification
- **Deposit Verification:** Amount must be a whole positive integer strictly $> 0$.
- **Withdrawal Verification (ATM Baseline):** Amount must strictly be a positive multiple of ₹500 (`amount % 500 === 0`) and cannot exceed current available balance.
- **Glassmorphic Warning Overlay:** Invalid inputs do not fail silently—they trigger an amber/red neon-glass warning notification with exact rule violations and auto-fade transitions.

### 5. 🔒 Session Termination (4. Lock Wallet / Exit)
- **Lock Wallet:** Transitions the user interface completely back to the unauthenticated PIN keypad view, preserving state securely.
- **Full Exit / Reset:** Clears session credentials and resets the session back to the unauthenticated onboarding screen.

### 6. 🔊 Zero-Asset Web Audio Synthesizer
Synthesizes 6 distinct spatial audio cues directly in-browser using the Web Audio API without downloading external audio files:
- **Click Tone:** $800\text{Hz}$ short decay pulse for keypad clicks.
- **Deposit Chord:** Dual-tone harmonious chime ($523\text{Hz} \to 659\text{Hz}$).
- **Withdrawal Tone:** Descending frequencies ($440\text{Hz} \to 349\text{Hz}$).
- **Warning / Error Buzzer:** Sawtooth wave at $150\text{Hz}$.
- **Critical Lockdown:** $90\text{Hz}$ deep alarm for security lockdown.
- **Hyperdrive Whoosh:** Filter-swept noise modulation.

---

## 📋 ATM.java Legacy Parity Matrix

| Legacy `ATM.java` Routine | Line Ref | Modern NEXUS Implementation | Status |
|---|---|---|---|
| `checkBalance()` | L7–9 | Real-time balance display & animated balance counter | ✅ Complete |
| `deposit(amount)` | L11–21 | Positive integer validation + WealthSphere cyan pulse | ✅ Complete |
| `withdraw(amount)` | L24–38 | Multiple of 500 validation + balance ceiling check | ✅ Complete |
| `authenticate(pin)` | L43–58 | 3-attempt limit + glass-shatter freeze overlay | ✅ Complete |
| `4. Exit` | L74 | Functional "Lock Wallet / Exit" session termination | ✅ Complete |

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **3D Graphics & Shaders:** [Three.js](https://threejs.org/) & [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber/)
- **Camera & Helpers:** [@react-three/drei](https://github.com/pmndrs/drei)
- **Animations & Layout Transitions:** [Framer Motion](https://www.framer.com/motion/)
- **Design System & Glassmorphism:** [Tailwind CSS v4](https://tailwindcss.com/) with native `backdrop-blur-xl`, `bg-slate-950/40`, and `border-white/10`
- **Audio Engine:** HTML5 Web Audio API (OscillatorNode, GainNode, BiquadFilterNode)

---

## 🚀 Local Installation & Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v18.18+ or v20+
- `npm`, `pnpm`, or `yarn`

### 1. Clone Repository
```bash
git clone https://github.com/your-username/nexus-3d-neobank.git
cd nexus-3d-neobank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your modern web browser (Chrome, Edge, Firefox, or Safari).

---

## 🧪 Production Build & Validation

To test optimized production compilation:

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📂 Project Directory Structure

```
nexus-3d-neobank/
├── app/
│   ├── components/
│   │   ├── DashboardView.jsx     # Spatial dashboard, operations & warning overlay
│   │   ├── FloatingInput.jsx     # Glassmorphic floating-label input
│   │   ├── GlassCard.jsx         # Tailwind v4 glassmorphic card container
│   │   ├── KineticStarfield.jsx  # WebGL 3D dynamic starfield & 1.5s warp speed-lines
│   │   ├── LoginView.jsx         # Biometric PIN authentication & SVG shatter overlay
│   │   ├── NeonButton.jsx        # Cyberpunk neon interaction buttons
│   │   ├── ParticleField.jsx     # Signup icosahedron particle assembly
│   │   ├── Scene3D.jsx           # R3F Canvas root orchestrator
│   │   ├── SignupView.jsx        # Dynamic 3-step account onboarding
│   │   ├── TransactionLog.jsx    # Real-time ledger with unique reconciliation keys
│   │   └── WealthSphere.jsx      # Morphing 3D wealth sphere with energy pulse
│   ├── context/
│   │   └── BankContext.jsx       # State persistence, session storage & business logic
│   ├── lib/
│   │   ├── useAudio.js           # Web Audio API 6-tone synthesizer
│   │   └── useBank.js            # Unified BankContext consumer hook
│   ├── globals.css               # Design tokens & Tailwind v4 glass utilities
│   ├── layout.js                 # Root layout with suppressHydrationWarning
│   └── page.js                   # Client-mounted root orchestrator
├── README_PORTFOLIO.md           # Professional portfolio documentation
└── package.json                  # Dependencies & execution scripts
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.
