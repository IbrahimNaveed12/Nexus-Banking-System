"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import WealthSphere from "./WealthSphere";
import ParticleField from "./ParticleField";
import KineticStarfield from "./KineticStarfield";

/**
 * Full-screen R3F Canvas scene.
 * Contains dynamic KineticStarfield backdrop, ParticleField assembly during signup,
 * and the interactive WealthSphere during dashboard.
 */
export default function Scene3D({ phase, assembleProgress, lastAction, balance }) {
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
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 2]}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      >
        {/* Ambient & Directional Space Lighting */}
        <ambientLight intensity={0.2} color="#4FACFE" />
        <directionalLight position={[5, 5, 5]} intensity={0.4} color="#00F2FE" />
        <directionalLight position={[-5, -3, -5]} intensity={0.2} color="#B388FF" />

        {/* Dynamic Kinetic 3D Starfield Backdrop */}
        <KineticStarfield lastAction={lastAction} />

        {/* Signup / Login: Particle field assembling */}
        {(phase === "signup" || phase === "login") && (
          <ParticleField
            assembleProgress={phase === "signup" ? assembleProgress : 1}
            color={phase === "login" ? "#4FACFE" : "#00F2FE"}
          />
        )}

        {/* Dashboard: Wealth Sphere */}
        {phase === "dashboard" && (
          <WealthSphere lastAction={lastAction} balance={balance} />
        )}

        {/* Camera controls — only on dashboard */}
        {phase === "dashboard" && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            rotateSpeed={0.3}
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
