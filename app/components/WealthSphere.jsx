"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The Core 3D Asset — "Wealth Sphere"
 * Responsive WebGL Optimization:
 * - On mobile (<768px):
 *   * Mesh segment detail reduced by 50-75% (<icosahedronGeometry args={[1, 2]} /> vs [1, 3])
 *   * Wireframe detail reduced (<icosahedronGeometry args={[1.02, 1]} /> vs [1.02, 2])
 *   * Particle budget reduced by 55% (90 vs 200 particles)
 *   * Dissolve fragment count halved (40 vs 80)
 *   * Active shadow map casting completely disabled
 */
export default function WealthSphere({ lastAction, balance, isMobile = false }) {
  const meshRef = useRef();
  const wireRef = useRef();
  const particlesRef = useRef();
  const dissolveRef = useRef();

  const actionType = lastAction?.type || "idle";
  const actionSuccess = lastAction?.success !== false;

  // ─── Scaled Particle System for Emissions (Budget Throttled on Mobile) ───
  const particleCount = isMobile ? 90 : 200;
  const particleGeo = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2 + Math.random() * 0.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      lifetimes[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities, lifetimes };
    return geo;
  }, [particleCount]);

  // ─── Dissolve fragments for withdrawal (Halved on Mobile) ───
  const fragmentCount = isMobile ? 40 : 80;
  const fragmentGeo = useMemo(() => {
    const positions = new Float32Array(fragmentCount * 3);
    const velocities = new Float32Array(fragmentCount * 3);
    for (let i = 0; i < fragmentCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = 1.0 * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 1.0 * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = 1.0 * Math.cos(phi);
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * 0.04;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * 0.04;
      velocities[i * 3 + 2] = Math.cos(phi) * 0.04;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.userData = { velocities };
    return geo;
  }, [fragmentCount]);

  // ─── Animation state ───
  const stateRef = useRef({
    targetScale: 1,
    currentScale: 1,
    rotSpeed: 0.003,
    targetRotSpeed: 0.003,
    pulsePhase: 0,
    actionAge: 999,
    emissiveIntensity: 0.3,
    targetEmissive: 0.3,
    particleSpread: 0,
    dissolveActive: false,
    dissolveProgress: 0,
    colorR: 0,
    colorG: 0.95,
    colorB: 1,
  });

  // ─── React to actions ───
  const lastActionIdRef = useRef(null);

  useFrame((_, delta) => {
    const s = stateRef.current;
    const dt = Math.min(delta, 0.05);

    // Detect new action
    const actionId = lastAction?.id || lastAction?.type || null;
    if (actionId !== lastActionIdRef.current) {
      lastActionIdRef.current = actionId;
      s.actionAge = 0;

      if (actionType === "BALANCE_CHECK") {
        s.targetEmissive = 0.8;
        s.targetRotSpeed = 0.005;
        s.targetScale = 1.05;
        s.particleSpread = 1;
        s.colorR = 0; s.colorG = 0.95; s.colorB = 1;
      } else if ((actionType === "DEPOSIT" || actionType === "INITIAL_DEPOSIT") && actionSuccess) {
        s.targetScale = 1.25;
        s.targetEmissive = 1.2;
        s.targetRotSpeed = 0.008;
        s.particleSpread = 2;
        s.colorR = 0; s.colorG = 0.95; s.colorB = 1; // cyan
      } else if (actionType === "WITHDRAWAL" && actionSuccess) {
        s.targetScale = 0.8;
        s.targetEmissive = 0.9;
        s.targetRotSpeed = 0.025;
        s.particleSpread = 0.5;
        s.dissolveActive = true;
        s.dissolveProgress = 0;
        s.colorR = 0.31; s.colorG = 0.67; s.colorB = 1; // violet
      } else if (!actionSuccess) {
        s.targetEmissive = 0.6;
        s.targetRotSpeed = 0.015;
        s.targetScale = 0.95;
        s.colorR = 1; s.colorG = 0.24; s.colorB = 0.44; // red
      }
    }

    s.actionAge += dt;

    // Decay back to idle after 2.5s
    if (s.actionAge > 2.5) {
      s.targetScale = 1;
      s.targetEmissive = 0.3;
      s.targetRotSpeed = 0.003;
      s.particleSpread = 0;
      s.dissolveActive = false;
      s.colorR += (0 - s.colorR) * dt * 0.5;
      s.colorG += (0.95 - s.colorG) * dt * 0.5;
      s.colorB += (1 - s.colorB) * dt * 0.5;
    }

    // Smooth interpolation
    const lerp = (a, b, t) => a + (b - a) * Math.min(t, 1);
    s.currentScale = lerp(s.currentScale, s.targetScale, dt * 3);
    s.rotSpeed = lerp(s.rotSpeed, s.targetRotSpeed, dt * 4);
    s.emissiveIntensity = lerp(s.emissiveIntensity, s.targetEmissive, dt * 5);
    s.pulsePhase += dt;

    // Apply to mesh
    if (meshRef.current) {
      meshRef.current.rotation.y += s.rotSpeed;
      meshRef.current.rotation.x = Math.sin(s.pulsePhase * 0.5) * 0.08;
      const pulse = 1 + Math.sin(s.pulsePhase * 2) * 0.02 * s.emissiveIntensity;
      const sc = s.currentScale * pulse;
      meshRef.current.scale.set(sc, sc, sc);
      meshRef.current.material.emissiveIntensity = s.emissiveIntensity;
      meshRef.current.material.emissive.setRGB(s.colorR, s.colorG, s.colorB);
    }

    if (wireRef.current) {
      wireRef.current.rotation.y += s.rotSpeed * 0.7;
      wireRef.current.rotation.x = Math.sin(s.pulsePhase * 0.3) * 0.05;
      const sc = s.currentScale * 1.01;
      wireRef.current.scale.set(sc, sc, sc);
    }

    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      const { velocities, lifetimes } = particlesRef.current.geometry.userData;
      for (let i = 0; i < particleCount; i++) {
        lifetimes[i] += dt * 0.3;
        if (lifetimes[i] > 1) {
          lifetimes[i] = 0;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.2;
          positions.array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions.array[i * 3 + 2] = r * Math.cos(phi);
        }
        const spread = 1 + s.particleSpread * lifetimes[i];
        positions.array[i * 3] += velocities[i * 3] * spread;
        positions.array[i * 3 + 1] += velocities[i * 3 + 1] * spread;
        positions.array[i * 3 + 2] += velocities[i * 3 + 2] * spread;
      }
      positions.needsUpdate = true;
      particlesRef.current.material.opacity = 0.3 + s.emissiveIntensity * 0.3;
    }

    // Dissolve fragments
    if (dissolveRef.current && s.dissolveActive) {
      s.dissolveProgress += dt * 0.8;
      const positions = dissolveRef.current.geometry.attributes.position;
      const { velocities } = dissolveRef.current.geometry.userData;
      for (let i = 0; i < fragmentCount; i++) {
        positions.array[i * 3] += velocities[i * 3] * (1 + s.dissolveProgress);
        positions.array[i * 3 + 1] += velocities[i * 3 + 1] * (1 + s.dissolveProgress);
        positions.array[i * 3 + 2] += velocities[i * 3 + 2] * (1 + s.dissolveProgress);
      }
      positions.needsUpdate = true;
      dissolveRef.current.material.opacity = Math.max(0, 1 - s.dissolveProgress);
      if (s.dissolveProgress > 1.5) {
        s.dissolveActive = false;
      }
    }
  });

  // Responsive geometry detail downscaling (50-75% reduction on mobile)
  const sphereDetail = isMobile ? 2 : 3;
  const wireDetail = isMobile ? 1 : 2;

  return (
    <group>
      {/* Core sphere with responsive segment reduction */}
      <mesh ref={meshRef} castShadow={false} receiveShadow={false}>
        <icosahedronGeometry args={[1, sphereDetail]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive={new THREE.Color(0, 0.95, 1)}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Wireframe overlay with reduced geometric complexity */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.02, wireDetail]} />
        <meshBasicMaterial
          color="#00F2FE"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Particle emissions (throttled count on mobile) */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          color="#00F2FE"
          size={isMobile ? 0.025 : 0.02}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dissolve fragments (for withdrawal) */}
      <points ref={dissolveRef} geometry={fragmentGeo}>
        <pointsMaterial
          color="#4FACFE"
          size={isMobile ? 0.045 : 0.04}
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Ambient point halo (shadows disabled on mobile) */}
      <pointLight
        color="#00F2FE"
        intensity={isMobile ? 0.6 : 0.8}
        distance={8}
        decay={2}
        position={[0, 0, 0]}
        castShadow={false}
      />
    </group>
  );
}
