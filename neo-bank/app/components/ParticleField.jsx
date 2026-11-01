"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Background particle field that assembles into a geometric shape
 * during signup as the user types their deposit amount.
 */
export default function ParticleField({ assembleProgress = 0, color = "#00F2FE" }) {
  const ref = useRef();
  const count = 600;

  const { randomPositions, targetPositions } = useMemo(() => {
    const rand = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random scattered positions
      rand[i * 3] = (Math.random() - 0.5) * 20;
      rand[i * 3 + 1] = (Math.random() - 0.5) * 14;
      rand[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Target: icosahedron surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 0.3;
      target[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      target[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      target[i * 3 + 2] = r * Math.cos(phi);
    }
    return { randomPositions: rand, targetPositions: target };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position;
    const dt = Math.min(delta, 0.05);
    const t = Math.min(Math.max(assembleProgress, 0), 1);

    for (let i = 0; i < count; i++) {
      const ri = i * 3;
      // Lerp between random and target based on assembleProgress
      const lerpSpeed = 1.5 * dt;
      const tx = randomPositions[ri] * (1 - t) + targetPositions[ri] * t;
      const ty = randomPositions[ri + 1] * (1 - t) + targetPositions[ri + 1] * t;
      const tz = randomPositions[ri + 2] * (1 - t) + targetPositions[ri + 2] * t;
      positions.array[ri] += (tx - positions.array[ri]) * lerpSpeed;
      positions.array[ri + 1] += (ty - positions.array[ri + 1]) * lerpSpeed;
      positions.array[ri + 2] += (tz - positions.array[ri + 2]) * lerpSpeed;
    }
    positions.needsUpdate = true;

    // Gentle rotation
    ref.current.rotation.y += dt * 0.15;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
