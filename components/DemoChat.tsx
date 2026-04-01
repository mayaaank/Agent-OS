"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line, Float, Text, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// --- 3D Mini Graph Component ---
function DemoAgentGraph({ activeStep }: { activeStep: number }) {
  const nodes = [
    { pos: [-1.2, 0.8, 0], label: "Analyst" },
    { pos: [1.2, 0.8, 0], label: "Strategist" },
    { pos: [1.2, -0.8, 0], label: "Architect" },
    { pos: [-1.2, -0.8, 0], label: "Engineer" },
  ];

  return (
    <div className="w-full h-40 mt-4 border border-cyan-500/20 bg-black/40 rounded-lg overflow-hidden relative group">
      <div className="absolute top-2 left-2 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
         <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Live Agent Swarm Visualization</span>
      </div>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Central Core */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[0.3, 32, 32]}>
            <MeshDistortMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={0.5}
              speed={4}
              distort={0.4}
            />
          </Sphere>
        </Float>

        {/* Orbiting Agent Nodes */}
        {nodes.map((node, i) => (
          <group key={i} position={node.pos as [number, number, number]}>
            <Sphere args={[0.15, 16, 16]}>
              <meshStandardMaterial
                color={activeStep > i ? "#00f0ff" : "#111"}
                emissive={activeStep > i ? "#00f0ff" : "#000"}
                emissiveIntensity={activeStep > i ? 2 : 0}
              />
            </Sphere>
            {/* Connection Line to center */}
            <Line
              points={[[0, 0, 0], [-node.pos[0], -node.pos[1], -node.pos[2]]]}
              color={activeStep > i ? "#00f0ff" : "#222"}
              lineWidth={activeStep > i ? 1.5 : 0.5}
              transparent
              opacity={activeStep > i ? 0.6 : 0.2}
            />
          </group>
        ))}

        {/* Animated Particles on final step */}
        {activeStep === 4 && <ParticleBurst />}
      </Canvas>
    </div>
  );
}

function ParticleBurst() {
  const points = useRef<THREE.Points>(null);
  const count = 100;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
        const p = points.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            p[i * 3] *= 1.05;
            p[i * 3 + 1] *= 1.05;
            p[i * 3 + 2] *= 1.05;
        }
        points.current.geometry.attributes.position.needsUpdate = true;
        points.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#00f0ff" size={0.05} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// --- Typing Animation Hook ---
function useTypingEffect(text: string, speed: number, startDelay: number = 0) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let i = 0;

    const type = () => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        timeout = setTimeout(type, speed);
      } else {
        setIsFinished(true);
      }
    };

    const delayTimeout = setTimeout(type, startDelay);

    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isFinished };
}

// --- Demo Chat Container ---
export default function DemoChat() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0); // 0: init, 1: typing user, 2: thinking, 3: response reveal, 4: agents
  const [agentStep, setAgentStep] = useState(0);

  const demoQuestion = "How do I turn a vague idea about building an AI agent swarm into a production-ready prompt?";
  const { displayedText: userText, isFinished: userFinished } = useTypingEffect(demoQuestion, 40, isPlaying ? 500 : 999999);

  useEffect(() => {
    if (userFinished && step === 0) {
      setStep(1);
      setTimeout(() => setStep(2), 1000); // Thinking
      setTimeout(() => setStep(3), 2500); // Response start
    }
  }, [userFinished, step]);

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setAgentStep(prev => {
           if (prev >= 4) {
             clearInterval(interval);
             return 4;
           }
           return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handlePlay = () => {
    setStep(0);
    setAgentStep(0);
    setIsPlaying(true);
  };

  const responseLines = [
    "AgentOS Orchestrator activated.",
    "1. Requirement Analyst → extracting constraints...",
    "2. Product Strategist → defining MVP scope...",
    "3. Technical Architect → suggesting stack...",
    "4. Prompt Engineer → generating optimized prompt.",
    "Final build-ready prompt ready for Cursor."
  ];

  return (
    <div className="flex-1 bg-[#0a0a0a] flex flex-col relative h-full font-sans">
      {/* Play/Reset Button Overlay */}
      {!isPlaying && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <button 
              onClick={handlePlay}
              className="px-8 py-3 bg-[#1f1f1f] border border-[#333] hover:border-[#00f0ff]/50 rounded-full text-white font-medium tracking-wide transition-all flex items-center gap-2 shadow-xl"
            >
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#00f0ff] border-b-[6px] border-b-transparent ml-1" />
              Watch Demo
            </button>
         </div>
      )}

      {/* Header Replay Link */}
      {isPlaying && (
         <button 
           onClick={handlePlay}
           className="absolute top-4 right-6 z-50 text-[11px] text-slate-500 uppercase tracking-widest hover:text-[#00f0ff] transition-colors"
         >
           [ Replay ]
         </button>
      )}

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
        {/* User Message */}
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-4 justify-end"
          >
            <div className="max-w-[85%] px-6 py-4 bg-[#1f1f1f] text-white rounded-[18px] rounded-tr-[4px] text-[15px] leading-[1.6] shadow-sm">
               {userText}
               {!userFinished && <span className="inline-block w-1.5 h-4 bg-[#00f0ff] ml-1 align-middle animate-pulse" />}
            </div>
          </motion.div>
        )}

        {/* Thinking Indicator */}
        {step === 2 && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             transition={{ duration: 0.2 }}
             className="flex flex-col gap-2"
           >
             <span className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.2em] ml-12">AgentOS</span>
             <div className="flex items-center gap-4 ml-12 px-6 py-4 bg-[#18181b] border-l-2 border-[#00f0ff] rounded-[4px] rounded-r-[18px] rounded-bl-[18px] w-fit">
               <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:0ms]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:200ms]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:400ms]" />
               </div>
             </div>
           </motion.div>
        )}

        {/* Response */}
        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
          >
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.2em] ml-12">AgentOS</span>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#18181b] border border-[#333] flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 mt-1">OS</div>
              <div className="flex-1 max-w-[90%] bg-[#18181b] border-l-2 border-[#00f0ff] px-6 py-5 rounded-[4px] rounded-r-[18px] rounded-bl-[18px] text-[15px] leading-[1.6] text-slate-200 relative">
                
                <div className="space-y-4">
                    {responseLines.map((line, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ 
                           opacity: agentStep >= (idx === 0 ? 0 : idx === 5 ? 4 : idx) ? 1 : 0
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-3"
                      >
                        {idx > 0 && idx < 5 && (
                           <div className={`mt-2.5 size-1.5 rounded-full transition-all duration-500 ${agentStep > idx-1 ? 'bg-[#00f0ff]' : 'bg-slate-800'}`} />
                        )}
                        <span className={idx === 0 ? "font-semibold text-white" : ""}>{line}</span>
                      </motion.div>
                    ))}
                </div>

                {/* 3D Graph (Subtle Container) */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="mt-6 border border-[#222] rounded-xl overflow-hidden"
                    >
                      <DemoAgentGraph activeStep={agentStep} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Overlay */}
      <div className="p-6 border-t border-[#1f1f1f]">
         <div className="h-12 border border-[#1f1f1f] rounded-full flex items-center px-6 bg-[#0a0a0a] shadow-inner">
            <span className="text-[15px] text-slate-500">Type your idea here...</span>
         </div>
      </div>
    </div>
  );
}
