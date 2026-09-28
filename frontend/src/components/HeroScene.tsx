'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Line, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const NODE_COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#38bdf8', '#a78bfa'];

/** The liquid "core" at the centre. */
function Core() {
  const mesh = useRef<THREE.Mesh>(null!);
  const cage = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
    cage.current.rotation.y -= delta * 0.08;
    cage.current.rotation.z += delta * 0.05;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={1.1}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.3, 24]} />
        <MeshDistortMaterial
          color="#7c5cff"
          emissive="#3a1bb5"
          emissiveIntensity={0.45}
          roughness={0.18}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.15}
          iridescence={1}
          iridescenceIOR={1.4}
          distort={0.42}
          speed={2}
        />
      </mesh>
      <mesh ref={cage} scale={1.85}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.16} />
      </mesh>
    </Float>
  );
}

/** Five glowing nodes on a rotating pentagon: the five founders. */
function PentaRing() {
  const spin = useRef<THREE.Group>(null!);
  const radius = 2.45;
  const points = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
        return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      }),
    [],
  );
  useFrame((state, delta) => {
    spin.current.rotation.z += delta * 0.14;
    spin.current.children.forEach((child, i) => {
      if (i === 0) return; // the line
      const s = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.18;
      child.scale.setScalar(s);
    });
  });
  return (
    <group rotation={[1.15, 0.2, 0]}>
      <group ref={spin}>
        <Line points={[...points, points[0]]} color="#a78bfa" lineWidth={1.4} transparent opacity={0.6} />
        {points.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.11, 32, 32]} />
            <meshStandardMaterial
              color={NODE_COLORS[i]}
              emissive={NODE_COLORS[i]}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Shifts the whole composition right on wide screens and follows the pointer. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { viewport } = useThree();
  const wide = viewport.width > 8;
  const x = wide ? viewport.width * 0.2 : 0;
  const y = wide ? 0 : viewport.height * 0.22;
  const scale = wide ? 1 : Math.min(0.72, viewport.width / 6.5);

  useFrame((state) => {
    const g = group.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, state.pointer.x * 0.35, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * 0.25, 0.05);
  });

  return (
    <group ref={group} position={[x, y, 0]} scale={scale}>
      {children}
    </group>
  );
}

export default function HeroScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#8b5cf6', '#0a0c1b', 1.2]} />
      <pointLight position={[4, 3, 4]} intensity={120} color="#22d3ee" />
      <pointLight position={[-4, -3, 3]} intensity={110} color="#f472b6" />
      <pointLight position={[0, 4, -3]} intensity={60} color="#a78bfa" />
      <directionalLight position={[2, 5, 5]} intensity={1.6} />
      <Rig>
        <Core />
        <PentaRing />
      </Rig>
      <Sparkles count={90} scale={[14, 8, 5]} size={2.2} speed={0.35} color="#c4b5fd" />
      <Stars radius={60} depth={40} count={1400} factor={3} fade speed={0.5} />
    </Canvas>
  );
}
