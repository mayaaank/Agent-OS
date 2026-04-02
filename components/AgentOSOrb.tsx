"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Float, Sparkles, Ring, Outlines } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bot, Rocket, Terminal } from "lucide-react";
import * as THREE from "three";

// --- 3D Orb Component ---
function GlowingOrb({ mousePosition, theme }: { mousePosition: { x: number, y: number }, theme: "dark" | "light" }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Parallax effect based on mouse position
      const targetX = (mousePosition.x / window.innerWidth - 0.5) * 2 * 0.5;
      const targetY = -(mousePosition.y / window.innerHeight - 0.5) * 2 * 0.5;
      
      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.05;
    }
    
    if (ring1Ref.current) ring1Ref.current.rotation.z -= delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.3;
    if (coreRef.current) {
        // Slow pulsing
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        coreRef.current.scale.set(scale, scale, scale);
    }
  });

  // Calculate dynamic size based on viewport to stay responsive
  const sizeMultiplier = Math.min(viewport.width, viewport.height) * 0.15;
  const baseRadius = Math.max(1.5, Math.min(sizeMultiplier, 2.5));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={theme === "dark" ? 0.5 : 2} />
      <pointLight position={[0, 0, 5]} intensity={theme === "dark" ? 2 : 1} color="#00f0ff" />
      
      {/* Background dark sphere to block light */}
      <Sphere args={[baseRadius - 0.1, 64, 64]}>
        <meshBasicMaterial color={theme === "dark" ? "#020617" : "#00C4D4"} transparent opacity={theme === "dark" ? 1 : 0.2} />
      </Sphere>

      {/* Pulsing Core */}
      <Sphere ref={coreRef} args={[baseRadius - 0.2, 32, 32]}>
        <meshStandardMaterial 
            color="#00f0ff" 
            emissive="#00f0ff" 
            emissiveIntensity={0.8}
            transparent 
            opacity={0.3} 
            wireframe 
        />
      </Sphere>

      {/* Energy Streaks / Inner details */}
      <Sparkles count={50} scale={baseRadius * 2} size={2} speed={0.4} opacity={0.5} color="#00f0ff" />

      {/* Rotating Concentric Rings */}
      <Ring ref={ring1Ref} args={[baseRadius + 0.1, baseRadius + 0.15, 64]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </Ring>
      <Ring ref={ring2Ref} args={[baseRadius + 0.3, baseRadius + 0.32, 64]} rotation={[0, 0, Math.PI / 4]}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>
      <Ring args={[baseRadius + 0.5, baseRadius + 0.51, 128]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} side={THREE.DoubleSide} />
        <Outlines thickness={0.02} color="#00f0ff" />
      </Ring>
    </group>
  );
}

// --- Floating Info Card ---
function InfoCard({ label, title, className, delay = 0 }: { label: string, title: string, className: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`absolute z-20 ${className}`}
    >
      <div className="p-4 md:p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border shadow-xl hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] hover:border-accent/50 transition-all group overflow-hidden max-w-[240px] md:max-w-[300px]">
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent group-hover:via-accent animate-[shimmer-slow_3s_infinite]" />
         <div className="text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-accent mb-3 opacity-70 group-hover:opacity-100 transition-opacity">{label}</div>
         <div className="text-sm md:text-lg font-bold text-foreground uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
            {title}
         </div>
      </div>
    </motion.div>
  );
}

// --- Main Hero Component ---
export default function AgentOSOrb() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    // Initial theme check
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // MutationObserver to watch theme changes
    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setTheme(isDarkNow ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const scrollToWorkspace = () => {
    const el = document.getElementById("demo");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.section 
      ref={containerRef}
      style={{ y: yParallax, opacity: opacityFade }}
      className="relative w-full h-[600px] flex items-center justify-center bg-transparent overflow-visible group"
    >
      {/* Background glow & gradients matched to SunHacks */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] z-0" />

      {/* Launch Button removed to avoid overlap with fixed header CTA */}


      {/* SVG Connector Lines (Responsive absolute positioning using percentages) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Top Left Line */}
        <motion.path 
          d="M 25% 30% L 40% 40% L 50% 50%" 
          fill="none" 
          stroke={theme === "dark" ? "#00f0ff" : "#00C4D4"} 
          strokeWidth="1" 
          strokeOpacity={theme === "dark" ? "0.2" : "0.4"}
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <circle cx="25%" cy="30%" r="3" fill={theme === "dark" ? "#00f0ff" : "#00C4D4"} filter="url(#glow)" className="animate-pulse" />

        {/* Top Right Line */}
        <motion.path 
          d="M 75% 30% L 60% 40% L 50% 50%" 
          fill="none" 
          stroke={theme === "dark" ? "#00f0ff" : "#00C4D4"} 
          strokeWidth="1" 
          strokeOpacity={theme === "dark" ? "0.2" : "0.4"}
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        <circle cx="75%" cy="30%" r="3" fill={theme === "dark" ? "#00f0ff" : "#00C4D4"} filter="url(#glow)" className="animate-pulse" />

        {/* Bottom Left Line */}
        <motion.path 
          d="M 25% 70% L 40% 60% L 50% 50%" 
          fill="none" 
          stroke={theme === "dark" ? "#00f0ff" : "#00C4D4"} 
          strokeWidth="1" 
          strokeOpacity={theme === "dark" ? "0.2" : "0.4"}
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        />
        <circle cx="25%" cy="70%" r="3" fill={theme === "dark" ? "#00f0ff" : "#00C4D4"} filter="url(#glow)" className="animate-pulse" />

        {/* Bottom Right Line */}
        <motion.path 
          d="M 75% 70% L 60% 60% L 50% 50%" 
          fill="none" 
          stroke={theme === "dark" ? "#00f0ff" : "#00C4D4"} 
          strokeWidth="1" 
          strokeOpacity={theme === "dark" ? "0.2" : "0.4"}
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
        />
        <circle cx="75%" cy="70%" r="3" fill={theme === "dark" ? "#00f0ff" : "#00C4D4"} filter="url(#glow)" className="animate-pulse" />
        
        {/* Animated flowing dots on lines */}
        {/* This creates the 'energy flowing' effect towards the center orb */}
        <circle r="2" fill={theme === "dark" ? "#fff" : "#00C4D4"} filter="url(#glow)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 25% 30% L 40% 40% L 48% 45%" />
        </circle>
        <circle r="2" fill={theme === "dark" ? "#fff" : "#00C4D4"} filter="url(#glow)">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M 75% 30% L 60% 40% L 52% 45%" begin="0.5s" />
        </circle>
        <circle r="2" fill={theme === "dark" ? "#fff" : "#00C4D4"} filter="url(#glow)">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M 25% 70% L 40% 60% L 48% 55%" begin="1s" />
        </circle>
        <circle r="2" fill={theme === "dark" ? "#fff" : "#00C4D4"} filter="url(#glow)">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M 75% 70% L 60% 60% L 52% 55%" begin="1.5s" />
        </circle>
      </svg>

      {/* Floating Cards mapped to SVG path starts */}
      <InfoCard 
         delay={0.2}
         label="Core Concept" 
         title="AI Requirement Interpreter + Prompt Generator" 
         className="top-[30%] left-[25%] -translate-x-[110%] -translate-y-[50%] hidden lg:block" 
      />
      <InfoCard 
         delay={0.4}
         label="Key Benefit" 
         title="Forces Clarification • No Hallucination" 
         className="top-[30%] right-[25%] translate-x-[110%] -translate-y-[50%] hidden lg:block" 
      />
      <InfoCard 
         delay={0.6}
         label="Architecture" 
         title="3-Layer System + Multi-Agent Pipeline" 
         className="top-[70%] left-[25%] -translate-x-[110%] -translate-y-[50%] hidden lg:block" 
      />
      <InfoCard 
         delay={0.8}
         label="USP" 
         title="Requirement-to-Prompt Operating System" 
         className="top-[70%] right-[25%] translate-x-[110%] -translate-y-[50%] hidden lg:block" 
      />

      {/* Central Interactive 3D Canvas */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] pointer-events-auto">
           <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
             <GlowingOrb mousePosition={mousePos} theme={theme} />
           </Canvas>
        </div>
      </div>

      {/* Robot floating inside the orb (DOM overlay for crispness) */}
      <motion.div 
         animate={{ y: [-15, 15, -15] }}
         transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
         <div className="relative flex items-center justify-center">
            {/* Inner glow backing for the robot */}
            <div className={`absolute inset-0 ${theme === "dark" ? "bg-cyan-950/80" : "bg-cyan-100/40"} rounded-full blur-xl scale-150`} />
            
            {/* The Robot */}
            <div className="relative w-20 h-20 rounded-2xl bg-card border border-accent/30 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center">
               <Bot className="w-10 h-10 text-accent drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
               <div className="absolute -bottom-2 w-8 h-1 bg-accent rounded-full blur-[2px] opacity-70" />
            </div>

            {/* Subtle orbital particles around robot */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute w-32 h-32 rounded-full border border-dashed border-cyan-500/30"
            >
               <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
            </motion.div>
         </div>
      </motion.div>
      
      {/* Title / Scrolldown indicator overlay at bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
         <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-transparent via-[#00f0ff] to-transparent"
         />
      </div>
    </motion.section>
  );
}
