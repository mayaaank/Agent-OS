"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Sparkles, Line, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

// Added: Three.js AgentOS Core with orbiting agents and data flow animation

function OrbitingAgent({ 
   index, total, radius, color, label, speed 
}: { 
   index: number, total: number, radius: number, color: string, label: string, speed: number 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const offset = (index / total) * Math.PI * 2;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * speed + offset;
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
      // Slight bobbing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + offset) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
      {/* Label */}
      <Html center position={[0, -0.3, 0]}>
         <div className="text-[9px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest whitespace-nowrap drop-shadow-[0_0_5px_#00f0ff]">
            {label}
         </div>
      </Html>
    </group>
  );
}

function DataFlowLines({ radius }: { radius: number }) {
  const lineRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
     if (lineRef.current) {
        lineRef.current.rotation.y = state.clock.elapsedTime * 0.15;
     }
  });

  const points = useMemo(() => {
     const pts = [];
     for(let i=0; i<4; i++) {
        const angle = (i/4) * Math.PI * 2;
        const curve = new THREE.QuadraticBezierCurve3(
           new THREE.Vector3(0, 0, 0),
           new THREE.Vector3(Math.cos(angle)*radius*0.5, 2, Math.sin(angle)*radius*0.5),
           new THREE.Vector3(Math.cos(angle)*radius, 0, Math.sin(angle)*radius)
        );
        pts.push(curve.getPoints(30));
     }
     return pts;
  }, [radius]);

  return (
    <group ref={lineRef}>
       {points.map((pts: THREE.Vector3[], i: number) => (
          <Line key={i} points={pts} color="#00f0ff" lineWidth={1} transparent opacity={0.3} />
       ))}
    </group>
  );
}

export default function AgentOSCore() {
  const agents = [
    { label: "Requirement Analyst", color: "#00f0ff", speed: 0.25 },
    { label: "Product Strategist", color: "#00f0ff", speed: 0.25 },
    { label: "Technical Architect", color: "#00f0ff", speed: 0.25 },
    { label: "Prompt Engineer", color: "#00f0ff", speed: 0.25 },
  ];

  return (
    <div className="w-full h-[500px] relative bg-black rounded-3xl border border-cyan-500/20 overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
         <h3 className="text-[#00f0ff] font-heading font-black text-xl tracking-widest uppercase drop-shadow-[0_0_15px_#00f0ff]">AgentOS Core</h3>
         <p className="text-cyan-600/60 font-mono text-[10px] uppercase tracking-[0.2em] mt-1">Multi-Agent Swarm Intelligence Engine</p>
      </div>

      <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#00f0ff" />
        
        {/* Central Core - Layered for Glow */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          {/* Inner solid spark */}
          <Sphere args={[0.25, 16, 16]}>
            <meshStandardMaterial color="#fff" emissive="#00f0ff" emissiveIntensity={5} />
          </Sphere>
          {/* Middle glow layer */}
          <Sphere args={[0.5, 32, 32]}>
            <meshStandardMaterial color="#00f0ff" transparent opacity={0.3} emissive="#00f0ff" emissiveIntensity={2} />
          </Sphere>
          {/* Outer wireframe shell */}
          <Sphere args={[0.9, 32, 32]}>
            <meshStandardMaterial 
              color="#000" 
              emissive="#00f0ff" 
              emissiveIntensity={0.8} 
              wireframe 
              transparent 
              opacity={0.2} 
            />
          </Sphere>
        </Float>

        {/* Dynamic Energy Flow Particles */}
        <Sparkles count={150} scale={4} size={3} speed={0.5} opacity={0.6} color="#00f0ff" />

        {/* Orbiting Agents */}
        {agents.map((agent, i) => (
           <OrbitingAgent key={i} index={i} total={agents.length} radius={3.5} {...agent} />
        ))}

        {/* Data Connections */}
        <DataFlowLines radius={3.5} />
      </Canvas>
    </div>
  );
}
