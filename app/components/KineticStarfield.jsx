"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Kinetic 3D Backdrop Environment
 * - Desktop: 1,400 depth-aware stars in 3D space.
 * - Mobile (<768px): Throttled to 800 stars (within 800-1000 mobile budget).
 * - Idle State: Orbital drift & mathematical noise cycle based on clock elapsedTime.
 * - Transaction Hyper-Drive Warp: 1.5s instantaneous acceleration where stars stretch
 *   into elongated cosmic speed-lines and smoothly decelerate back to idle drift.
 * - Mouse-Parallax: Inverted window pointer tracking.
 */
export default function KineticStarfield({ lastAction, isMobile = false }) {
  const pointsRef = useRef();
  const linesRef = useRef();

  // Warp physics state
  const warpState = useRef({
    active: false,
    startTime: 0,
    duration: 1.5,
    intensity: 0,
    actionType: null,
  });

  // Parallax smoothing state
  const parallax = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
  });

  // Trigger Hyper-Drive Warp on successful Deposit or Withdrawal
  useEffect(() => {
    if (
      lastAction &&
      lastAction.success &&
      (lastAction.type === "DEPOSIT" ||
        lastAction.type === "WITHDRAWAL" ||
        lastAction.type === "INITIAL_DEPOSIT")
    ) {
      warpState.current.active = true;
      warpState.current.startTime = performance.now() / 1000;
      warpState.current.intensity = 1.0;
      warpState.current.actionType = lastAction.type;
    }
  }, [lastAction]);

  // Mobile particle budget throttling: 800 particles on mobile vs 1400 on desktop
  const count = isMobile ? 800 : 1400;

  // Generate particle coordinates and speed attributes
  const { positions, baseCoords, speeds, colors, linePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const linePos = new Float32Array(count * 6);

    const cyan = new THREE.Color("#00F2FE");
    const violet = new THREE.Color("#4FACFE");
    const white = new THREE.Color("#FFFFFF");
    const purple = new THREE.Color("#B388FF");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i6 = i * 6;

      // Distribute in a wide cylinder / box in deep space
      const radius = 8 + Math.random() * 32;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 70 - 15; // -50 to +20

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      spd[i] = 0.8 + Math.random() * 1.4;

      // Color variation
      const choice = Math.random();
      let picked = white;
      if (choice < 0.45) picked = cyan;
      else if (choice < 0.75) picked = violet;
      else if (choice < 0.9) picked = purple;

      col[i3] = picked.r;
      col[i3 + 1] = picked.g;
      col[i3 + 2] = picked.b;

      // Line positions: vertex 0 (head), vertex 1 (tail)
      linePos[i6] = x;
      linePos[i6 + 1] = y;
      linePos[i6 + 2] = z;
      linePos[i6 + 3] = x;
      linePos[i6 + 4] = y;
      linePos[i6 + 5] = z;
    }

    return {
      positions: pos,
      baseCoords: base,
      speeds: spd,
      colors: col,
      linePositions: linePos,
    };
  }, [count]);

  const pointGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineCols = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i6 = i * 6;
      lineCols[i6] = colors[i3];
      lineCols[i6 + 1] = colors[i3 + 1];
      lineCols[i6 + 2] = colors[i3 + 2];
      lineCols[i6 + 3] = colors[i3];
      lineCols[i6 + 4] = colors[i3 + 1];
      lineCols[i6 + 5] = colors[i3 + 2];
    }
    geo.setAttribute("color", new THREE.BufferAttribute(lineCols, 3));
    return geo;
  }, [linePositions, colors, count]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // ─── 1. Parallax Smoothing ───
    parallax.current.targetX = -state.pointer.x * (isMobile ? 1.2 : 2.2);
    parallax.current.targetY = -state.pointer.y * (isMobile ? 0.9 : 1.6);
    parallax.current.currentX +=
      (parallax.current.targetX - parallax.current.currentX) * dt * 4.0;
    parallax.current.currentY +=
      (parallax.current.targetY - parallax.current.currentY) * dt * 4.0;

    // ─── 2. Warp Physics Lifecycle (1.5 seconds) ───
    let currentWarp = 0;
    if (warpState.current.active) {
      const elapsedWarp = performance.now() / 1000 - warpState.current.startTime;
      if (elapsedWarp >= warpState.current.duration) {
        warpState.current.active = false;
        warpState.current.intensity = 0;
      } else {
        const progress = elapsedWarp / warpState.current.duration;
        const decay = Math.pow(1 - progress, 2.5);
        currentWarp = decay;
        warpState.current.intensity = decay;
      }
    }

    // ─── 3. Movement Vectors & Speed Lines ───
    if (!pointsRef.current || !linesRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const lineAttr = linesRef.current.geometry.attributes.position;

    const warpVelocity = currentWarp * (isMobile ? 40.0 : 55.0);
    const idleSpeed = 0.8;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i6 = i * 6;
      const starSpeed = speeds[i];

      const noiseX = Math.sin(time * 0.12 * starSpeed + baseCoords[i3 + 1] * 0.08) * 0.04;
      const noiseY = Math.cos(time * 0.15 * starSpeed + baseCoords[i3] * 0.08) * 0.04;

      const forwardMovement = (idleSpeed + warpVelocity) * starSpeed * dt;
      let newZ = posAttr.array[i3 + 2] + forwardMovement;

      if (newZ > 12) {
        newZ = -55 - Math.random() * 10;
      }

      const newX = baseCoords[i3] + noiseX;
      const newY = baseCoords[i3 + 1] + noiseY;

      posAttr.array[i3] = newX;
      posAttr.array[i3 + 1] = newY;
      posAttr.array[i3 + 2] = newZ;

      const tailLength = currentWarp > 0.01 ? (0.2 + currentWarp * (isMobile ? 5.0 : 7.5) * starSpeed) : 0.01;

      lineAttr.array[i6] = newX;
      lineAttr.array[i6 + 1] = newY;
      lineAttr.array[i6 + 2] = newZ;

      lineAttr.array[i6 + 3] = newX;
      lineAttr.array[i6 + 4] = newY;
      lineAttr.array[i6 + 5] = newZ - tailLength;
    }

    posAttr.needsUpdate = true;
    lineAttr.needsUpdate = true;

    const orbitalSwayX = Math.sin(time * 0.1) * 0.03;
    const orbitalSwayY = Math.cos(time * 0.08) * 0.03;

    pointsRef.current.position.x = parallax.current.currentX;
    pointsRef.current.position.y = parallax.current.currentY;
    pointsRef.current.rotation.x = orbitalSwayX;
    pointsRef.current.rotation.y = orbitalSwayY + time * 0.02;

    linesRef.current.position.x = parallax.current.currentX;
    linesRef.current.position.y = parallax.current.currentY;
    linesRef.current.rotation.x = orbitalSwayX;
    linesRef.current.rotation.y = orbitalSwayY + time * 0.02;
  });

  return (
    <group>
      {/* Star points (glowing heads) */}
      <points ref={pointsRef} geometry={pointGeometry}>
        <pointsMaterial
          size={isMobile ? 0.075 : 0.065}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Speed-lines (elongated streaks on warp) */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={warpState.current.intensity > 0.02 ? 0.75 : 0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
