'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

// 1. Transparent Model Component
function TransparentBrainModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => {
            const m = mat.clone();
            m.transparent = true;
            m.opacity = 0.2;
            m.depthWrite = false;
            return m;
          });
        } else if (mesh.material) {
          const m = mesh.material.clone();
          m.transparent = true;
          m.opacity = 0.2;
          m.depthWrite = false;
          mesh.material = m;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

interface FadingConnection {
  id: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  toIdx: number;
  avgNeuronSize: number;
  createdAt: number;
  duration: number;
}

interface NetworkProps {
  count?: number;
  centerOffset?: [number, number, number];
  radius?: [number, number, number];
  basePropagationChance?: number;
  randomPropagationVariance?: number;
  baseInterval?: number;
  randomIntervalVariance?: number;
  maxConnections?: number;
}

function NeuronNetwork({
  count = 240,
  centerOffset = [0, 0.15, 0],
  radius = [0.35, 0.32, 0.48],
  basePropagationChance = 0.35,
  randomPropagationVariance = 0.6,
  baseInterval = 0.15,
  randomIntervalVariance = 0.35,
  maxConnections = 60,
}: NetworkProps) {
  const activeConnections = useRef<FadingConnection[]>([]);
  const [, setTick] = React.useState(0);

  // Initialize THREE.Timer to replace deprecated THREE.Clock
  const timer = useRef(new THREE.Timer());

  const offsetKey = centerOffset.join(',');
  const radiusKey = radius.join(',');

  const { neurons, neuronSizes, particlePositions, particleSizes } = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const sizes = new Float32Array(count);
    const flatPositions = new Float32Array(count * 3);

    const [radX, radY, radZ] = radius;
    const [offX, offY, offZ] = centerOffset;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random());

      const x = r * radX * Math.sin(phi) * Math.cos(theta) + offX;
      const y = r * radY * Math.sin(phi) * Math.sin(theta) + offY;
      const z = r * radZ * Math.cos(phi) + offZ;

      const position = new THREE.Vector3(x, y, z);
      const size = 24 + Math.random() * 24;

      pos.push(position);
      sizes[i] = size;

      flatPositions[i * 3] = x;
      flatPositions[i * 3 + 1] = y;
      flatPositions[i * 3 + 2] = z;
    }

    return {
      neurons: pos,
      neuronSizes: sizes,
      particlePositions: flatPositions,
      particleSizes: sizes,
    };
  }, [count, offsetKey, radiusKey]);

  const pointShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        color: { value: new THREE.Color('#38bdf8') },
      },
      vertexShader: `
        attribute float aSize;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, dist) * 0.95;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
  }, []);

  // Iterative Queue-based propagation (prevents stack overflow)
  const fireFromNeuron = (rootIdx: number, currentTime: number) => {
    const queue: { idx: number; depth: number }[] = [{ idx: rootIdx, depth: 0 }];
    const maxDepth = 4; // Limits deep runaway cascades safely

    while (queue.length > 0 && activeConnections.current.length < maxConnections) {
      const { idx: sourceIdx, depth } = queue.shift()!;
      const sourcePos = neurons[sourceIdx];
      const neighbors: { pos: THREE.Vector3; idx: number }[] = [];

      neurons.forEach((targetPos, idx) => {
        if (idx !== sourceIdx) {
          const dist = sourcePos.distanceTo(targetPos);
          if (dist > 0.04 && dist < 0.22) {
            neighbors.push({ pos: targetPos, idx });
          }
        }
      });

      if (neighbors.length > 0) {
        const targetCount = Math.min(Math.floor(Math.random() * 4) + 1, neighbors.length);
        const shuffled = [...neighbors].sort(() => 0.5 - Math.random());
        const selectedTargets = shuffled.slice(0, targetCount);

        selectedTargets.forEach((target) => {
          const senderSize = neuronSizes[sourceIdx];
          const receiverSize = neuronSizes[target.idx];
          const avgNeuronSize = (senderSize + receiverSize) / 2;

          activeConnections.current.push({
            id: `${currentTime}-${Math.random()}-${Math.random()}`,
            from: sourcePos.clone(),
            to: target.pos.clone(),
            toIdx: target.idx,
            avgNeuronSize,
            createdAt: currentTime,
            duration: 0.9,
          });

          const normalizedSize = (receiverSize - 24) / 24;
          const propagationChance =
            basePropagationChance + normalizedSize * randomPropagationVariance;

          if (depth < maxDepth && Math.random() < propagationChance) {
            queue.push({ idx: target.idx, depth: depth + 1 });
          }
        });
      }
    }
  };

  const lastBurstTime = useRef(0);
  const nextInterval = useRef(0.2);
  const currentElapsedTime = useRef(0);

  // Frame Loop using THREE.Timer with global maxConnections enforcement
  useFrame(() => {
    timer.current.update();
    const currentTime = timer.current.getElapsed();
    currentElapsedTime.current = currentTime;

    if (currentTime - lastBurstTime.current > nextInterval.current) {
      lastBurstTime.current = currentTime;
      nextInterval.current =
        baseInterval + Math.random() * randomIntervalVariance;

      const neuronsToFireCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < neuronsToFireCount; i++) {
        const rootIdx = Math.floor(Math.random() * neurons.length);
        fireFromNeuron(rootIdx, currentTime);
      }
    }

    const initialCount = activeConnections.current.length;
    
    // Filter out expired connections
    activeConnections.current = activeConnections.current.filter((conn) => {
      return currentTime - conn.createdAt < conn.duration;
    });

    // Enforce global maximum concurrent connections cap
    if (activeConnections.current.length > maxConnections) {
      activeConnections.current = activeConnections.current.slice(-maxConnections);
    }

    if (initialCount > 0 || activeConnections.current.length > 0) {
      setTick((t) => (t + 1) % 1000);
    }
  });

  return (
    <group>
      <points material={pointShaderMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-aSize"
            args={[particleSizes, 1]}
          />
        </bufferGeometry>
      </points>

      {activeConnections.current.map((conn) => {
        const age = currentElapsedTime.current - conn.createdAt;
        const fade = Math.max(0, Math.pow(1 - age / conn.duration, 1.2));

        const sizeMultiplier = conn.avgNeuronSize / 36;
        const baseThickness = 3.0 * sizeMultiplier; // User custom thickness

        const lineWidth = baseThickness * fade;
        const opacity = 1.0 * fade;

        if (lineWidth <= 0.1) return null;

        return (
          <Line
            key={conn.id}
            points={[conn.from, conn.to]}
            color="#5bc1c1" // User custom color
            lineWidth={lineWidth}
            transparent
            opacity={opacity}
            blending={THREE.NormalBlending}
            toneMapped={false}
          />
        );
      })}
    </group>
  );
}

export default function BrainScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030712' }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <hemisphereLight color="#60a5fa" groundColor="#0f172a" intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} />
        <directionalLight position={[-10, -10, -5]} intensity={1.0} color="#38bdf8" />
        <pointLight position={[0, 0, 3]} color="#ffffff" intensity={0.8} />

        <TransparentBrainModel url="/models/brain.glb" />

        <NeuronNetwork
          count={240}
          centerOffset={[0, 0.15, 0]}
          radius={[0.35, 0.32, 0.48]}
          basePropagationChance={0.5}
          randomPropagationVariance={0.5}
          baseInterval={0.15}
          randomIntervalVariance={0.35}
          maxConnections={60}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}