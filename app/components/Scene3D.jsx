"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WealthSphere from "./WealthSphere";
import ParticleField from "./ParticleField";
import KineticStarfield from "./KineticStarfield";
import { useIsMobile } from "../lib/useIsMobile";

/**
 * Full-screen R3F Canvas scene with mobile performance optimizations:
 * - Dynamic DPR Caps: [1, 1.5] on mobile (<768px) vs [1, 2] on desktop
 * - Shadow mapping disabled completely on mobile
 * - Conditional geometry & particle count downscaling
 */
export default function Scene3D({ phase, assembleProgress, lastAction, balance }) {
  const isMobile = useIsMobile(768);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        gl={{
          antialias: !isMobile, // Disable MSAA on mobile for fill-rate efficiency
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          depth: true,
          stencil: false,
        }}
        shadows={!isMobile} // Disable expensive shadow map casting on mobile displays
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Restrict DPR on mobile to prevent over-rendering
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      >
        {/* Ambient & Directional Space Lighting */}
        <ambientLight intensity={0.2} color="#4FACFE" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.4}
          color="#00F2FE"
          castShadow={!isMobile}
        />
        <directionalLight
          position={[-5, -3, -5]}
          intensity={0.2}
          color="#B388FF"
        />

        {/* Dynamic Kinetic 3D Starfield Backdrop (throttled on mobile) */}
        <KineticStarfield lastAction={lastAction} isMobile={isMobile} />

        {/* Signup / Login: Particle field assembling (reduced budget on mobile) */}
        {(phase === "signup" || phase === "login") && (
          <ParticleField
            assembleProgress={phase === "signup" ? assembleProgress : 1}
            color={phase === "login" ? "#4FACFE" : "#00F2FE"}
            isMobile={isMobile}
          />
        )}

        {/* Dashboard: Wealth Sphere (geometry downscaled 40-50% on mobile) */}
        {phase === "dashboard" && (
          <WealthSphere
            lastAction={lastAction}
            balance={balance}
            isMobile={isMobile}
          />
        )}

        {/* Camera controls — only on dashboard */}
        {phase === "dashboard" && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            rotateSpeed={isMobile ? 0.2 : 0.3}
            autoRotate
            autoRotateSpeed={0.25}
            maxPolarAngle={Math.PI * 0.65}
            minPolarAngle={Math.PI * 0.35}
          />
        )}
      </Canvas>
    </div>
  );
}
