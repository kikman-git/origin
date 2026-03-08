"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { AgentState } from "../page";

type Props = {
  agents: Record<string, AgentState>;
  highlightedEvidence: string[];
};

const AGENT_NODES = [
  { id: "orchestrator", label: "ORCH", x: 0, y: 2, z: 0, color: "#f59e0b", scale: 1.2 },
  { id: "ir", label: "IR", x: -3, y: 0, z: 1, color: "#06b6d4", scale: 0.8 },
  { id: "company", label: "CO", x: -1, y: 0, z: -1, color: "#f59e0b", scale: 0.8 },
  { id: "news", label: "NEWS", x: 1, y: 0, z: -1, color: "#22c55e", scale: 0.8 },
  { id: "satellite", label: "SAT", x: 3, y: 0, z: 1, color: "#ec4899", scale: 0.8 },
  { id: "bull", label: "BULL", x: -2, y: -2.5, z: 0, color: "#22c55e", scale: 0.9 },
  { id: "bear", label: "BEAR", x: 2, y: -2.5, z: 0, color: "#ef4444", scale: 0.9 },
  { id: "judge", label: "JUDGE", x: 0, y: -4, z: 0, color: "#f97316", scale: 1.0 },
];

const CONNECTIONS = [
  ["orchestrator", "ir"],
  ["orchestrator", "company"],
  ["orchestrator", "news"],
  ["orchestrator", "satellite"],
  ["ir", "bull"],
  ["ir", "bear"],
  ["company", "bull"],
  ["company", "bear"],
  ["news", "bull"],
  ["news", "bear"],
  ["satellite", "bull"],
  ["satellite", "bear"],
  ["bull", "judge"],
  ["bear", "judge"],
];

function ParticleStream({ start, end, color, active }: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  active: boolean;
}) {
  const ref = useRef<THREE.Points>(null);
  const count = 20;

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      pos[i * 3] = start[0] + (end[0] - start[0]) * t;
      pos[i * 3 + 1] = start[1] + (end[1] - start[1]) * t;
      pos[i * 3 + 2] = start[2] + (end[2] - start[2]) * t;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [start, end]);

  useFrame(() => {
    if (!ref.current || !active) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const t = ((i / count) + Date.now() * 0.001) % 1;
      pos[i * 3] = start[0] + (end[0] - start[0]) * t;
      pos[i * 3 + 1] = start[1] + (end[1] - start[1]) * t;
      pos[i * 3 + 2] = start[2] + (end[2] - start[2]) * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={active ? 0.06 : 0.02}
        color={color}
        transparent
        opacity={active ? 0.8 : 0.15}
        sizeAttenuation
      />
    </points>
  );
}

function ConnectionLine({ start, end, color, active }: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  active: boolean;
}) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: active ? 0.3 : 0.06 });
    return new THREE.Line(geo, mat);
  }, [start, end, color, active]);

  return (
    <group>
      <primitive object={lineObj} />
      <ParticleStream start={start} end={end} color={color} active={active} />
    </group>
  );
}

function AgentSphere({ position, color, label, status, scale }: {
  position: [number, number, number];
  color: string;
  label: string;
  status: string;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isRunning = status === "running";
  const isDone = status === "completed";

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isRunning) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const baseScale = isDone ? scale * 1.1 : isRunning ? scale * 1.0 : scale * 0.7;
  const emissiveIntensity = isRunning ? 2 : isDone ? 1 : 0.1;

  return (
    <Float speed={isRunning ? 3 : 1} rotationIntensity={isRunning ? 0.3 : 0.1} floatIntensity={isRunning ? 0.5 : 0.2}>
      <group position={position}>
        {/* Glow sphere */}
        {(isRunning || isDone) && (
          <mesh scale={baseScale * 2}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={isRunning ? 0.08 : 0.04} />
          </mesh>
        )}
        {/* Main sphere */}
        <mesh ref={meshRef} scale={baseScale}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.3}
            metalness={0.8}
            distort={isRunning ? 0.2 : 0.05}
            speed={isRunning ? 4 : 1}
          />
        </mesh>
        {/* Label */}
        <Text
          position={[0, -0.7 * scale, 0]}
          fontSize={0.2}
          color={isDone ? color : isRunning ? "#ffffff" : "#555555"}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          {label}
        </Text>
        {/* Status ring */}
        {isRunning && (
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={baseScale}>
            <ringGeometry args={[0.55, 0.6, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

function BackgroundParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 500;

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.02} color="#334155" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene({ agents }: { agents: Record<string, AgentState> }) {
  const getPos = (id: string): [number, number, number] => {
    const node = AGENT_NODES.find((n) => n.id === id);
    return node ? [node.x, node.y, node.z] : [0, 0, 0];
  };

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#f59e0b" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#06b6d4" />
      <pointLight position={[5, -3, 3]} intensity={0.3} color="#ec4899" />

      <BackgroundParticles />

      {CONNECTIONS.map(([from, to]) => {
        const fromAgent = agents[from];
        const toAgent = agents[to];
        const active = (fromAgent?.status === "running" || fromAgent?.status === "completed") &&
                       (toAgent?.status === "running" || toAgent?.status === "completed");
        const color = AGENT_NODES.find((n) => n.id === from)?.color || "#444";
        return (
          <ConnectionLine
            key={`${from}-${to}`}
            start={getPos(from)}
            end={getPos(to)}
            color={color}
            active={active}
          />
        );
      })}

      {AGENT_NODES.map((node) => {
        const agent = agents[node.id];
        return (
          <AgentSphere
            key={node.id}
            position={[node.x, node.y, node.z]}
            color={node.color}
            label={node.label}
            status={agent?.status || "idle"}
            scale={node.scale}
          />
        );
      })}
    </>
  );
}

export default function AgentNetwork3D({ agents }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 h-[500px] flex items-center justify-center">
        <span className="text-zinc-600 text-sm">Loading 3D Scene...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#050510] overflow-hidden relative">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Agent Network</span>
        <span className="text-[9px] text-zinc-600">LIVE</span>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ height: 500 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene agents={agents} />
      </Canvas>
    </div>
  );
}
