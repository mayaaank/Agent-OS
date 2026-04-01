"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Line, Html } from "@react-three/drei";
import * as THREE from "three";

function AgentNode({ position, label, active, color }: { position: [number, number, number], label: string, active: boolean, color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3} position={position}>
      <Sphere args={[0.15, 32, 32]}>
        <meshStandardMaterial 
           color={active ? color : "#222"} 
           emissive={color} 
           emissiveIntensity={active ? 2 : 0} 
           toneMapped={false}
        />
      </Sphere>
      <Html center position={[0, -0.6, 0]} className="pointer-events-none select-none">
         <div className={`text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap text-center transition-all duration-700 ${active ? 'text-white opacity-100 scale-105' : 'text-slate-600 opacity-40 scale-100'}`}>
            {label}
         </div>
      </Html>
    </Float>
  );
}

function DataFlow({ start, end, active }: { start: THREE.Vector3, end: THREE.Vector3, active: boolean }) {
  const lineRef = useRef<any>(null);
  
  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.dashOffset -= 0.01;
    }
  });

  return (
    <Line 
      ref={lineRef}
      points={[start, end]} 
      color="#00f0ff" 
      lineWidth={1} 
      dashed 
      dashSize={0.2} 
      dashScale={1} 
      transparent 
      opacity={active ? 0.3 : 0.05} 
    />
  );
}

export default function MultiAgentFlow() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const agents = [
    { label: "Analyst", x: -3 },
    { label: "Strategist", x: -1 },
    { label: "Architect", x: 1 },
    { label: "Prompt Engineer", x: 3 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % agents.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const path = useMemo(() => agents.map(a => new THREE.Vector3(a.x, 0, 0)), []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Connection Lines */}
        {path.slice(0, -1).map((point, i) => (
          <DataFlow 
            key={`line-${i}`} 
            start={point} 
            end={path[i+1]} 
            active={activeIndex >= i} 
          />
        ))}

        {/* Agent Nodes */}
        {agents.map((agent, i) => (
          <AgentNode 
            key={agent.label} 
            position={[agent.x, 0, 0]} 
            label={agent.label} 
            active={activeIndex === i}
            color="#00f0ff"
          />
        ))}
      </Canvas>
    </div>
  );
}
