"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  signal: string;
  confidence: number;
};

function VerdictRing({ radius, color, speed, opacity }: {
  radius: number; color: string; speed: number; opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
      ref.current.rotation.x = Math.sin(Date.now() * 0.001 * speed) * 0.1;
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 64]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function ConfidenceRing({ confidence, color }: { confidence: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const arc = (confidence / 100) * Math.PI * 2;

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.6, 0.08, 16, 64, arc]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function ExplosionParticles({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const { geo, velocities } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 2;
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo: g, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] * delta * 0.5;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta * 0.5;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta * 0.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, mat.opacity - delta * 0.15);
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.04} color={color} transparent opacity={1} sizeAttenuation />
    </points>
  );
}

function VerdictScene({ signal, confidence }: Props) {
  const isBuy = signal === "BUY";
  const color = isBuy ? "#10b981" : signal === "SELL" ? "#ef4444" : "#f59e0b";
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 4]} intensity={1.5} color={color} />
      <pointLight position={[3, 3, 2]} intensity={0.5} color="#ffffff" />

      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.9}
          distort={0.15}
          speed={2}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>

      <VerdictRing radius={1.3} color={color} speed={0.5} opacity={0.3} />
      <VerdictRing radius={1.5} color={color} speed={-0.3} opacity={0.2} />
      <VerdictRing radius={1.8} color="#ffffff" speed={0.15} opacity={0.05} />

      <ConfidenceRing confidence={confidence} color={color} />

      <Text
        position={[0, 0, 1.5]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
        outlineWidth={0.02}
        outlineColor={color}
      >
        {signal}
      </Text>

      <Text
        position={[0, -0.8, 1.5]}
        fontSize={0.2}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        {`${confidence}% CONFIDENCE`}
      </Text>

      <ExplosionParticles color={color} />
    </>
  );
}

export default function Verdict3D({ signal, confidence }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-[#050510] overflow-hidden animate-slam-in">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ height: 300 }}
        gl={{ antialias: true, alpha: true }}
      >
        <VerdictScene signal={signal} confidence={confidence} />
      </Canvas>
    </div>
  );
}
