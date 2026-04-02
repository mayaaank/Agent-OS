"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Clean & Fixed "AGENT OS" Title Component
 * Focuses on surgical clarity, pure typography, and the flagship screenshot gradient.
 */

export default function AgentOSTitle() {
  const [isGlitching, setIsGlitching] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax fade and subtle shift
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const yShift = useTransform(scrollY, [0, 400], [0, -30]);

  useEffect(() => {
    // Initial entry glitch sequence
    const entryTimer = setTimeout(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 1200);

    return () => clearTimeout(entryTimer);
  }, []);

  return (
    <motion.section
      style={{ opacity, y: yShift }}
      className="relative w-full py-12 flex flex-col items-center justify-center select-none overflow-visible z-[60]"
    >
      {/* Subtle Background Particles - Surgical Clarity */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              scale: [0.8, 1, 0.8],
              x: Math.random() * 200 - 100,
              y: Math.random() * 100 - 50
            }}
            transition={{ 
              duration: Math.random() * 4 + 4, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="absolute size-1 rounded-full bg-primary/20 blur-[1px]"
            style={{ 
              left: `${50 + (Math.random() * 60 - 30)}%`, 
              top: `${50 + (Math.random() * 40 - 20)}%` 
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        <motion.h1 
          animate={{ 
            scale: [1, 1.01, 1],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative text-[16vw] md:text-[6.5rem] lg:text-[8rem] font-extrabold tracking-[-0.05em] leading-none flex items-center justify-center gap-[0.1em]"
        >
          {/* Main Segment: AGENT */}
          <span className="relative inline-block text-foreground">
             {isGlitching && (
                <span className="absolute inset-0 text-cyan-400 translate-x-[1px] blur-[1px] opacity-70">AGENT</span>
             )}
             AGENT
          </span>

          {/* Core Brand: OS (Vibrant Screenshot Gradient) */}
          <span className="relative inline-block bg-gradient-to-r from-[#67E8F9] via-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(103,232,249,0.1)]">
             {isGlitching && (
                <span className="absolute inset-0 text-pink-400 -translate-x-[1px] blur-[1px] opacity-70">OS</span>
             )}
             OS
          </span>
          
          {/* Surgical tech-accent underline */}
          <motion.div 
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 2, ease: "circOut" }}
            className="absolute -bottom-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          />
        </motion.h1>

        {/* Minimal system status pill */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 2, duration: 1 }}
           className="mt-8 flex items-center gap-2"
        >
           <div className="size-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground/60">System.V7_Active</span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
