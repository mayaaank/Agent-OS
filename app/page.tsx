"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Layout,
  Terminal as TerminalIcon,
  Cpu,
  Globe,
  MessageSquare,
  BarChart3,
  ArrowDown
} from "lucide-react";
import dynamic from "next/dynamic";

// Premium Dynamic Components
const AgentOSTitle = dynamic(() => import("@/components/AgentOSTitle"), { ssr: false });
const AgentOSOrb = dynamic(() => import("@/components/AgentOSOrb"), { ssr: false });
const AgentOSWorkspaceMock = dynamic(() => import("@/components/AgentOSWorkspaceMock"), { ssr: false });
const MultiAgentFlow = dynamic(() => import("@/components/MultiAgentFlow"), { ssr: false });

// Refined Local Components
import ThemeToggle from "@/components/ThemeToggle";
import FeatureCards from "@/components/FeatureCards";
import ComparisonTable from "@/components/ComparisonTable";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* 1. Navbar — Minimal & Floating */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center py-6 px-4">
        <div className="max-w-7xl w-full h-16 glass rounded-full flex items-center justify-between px-8 shadow-2xl transition-all hover:bg-accent/5">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">A</div>
             <span className="font-bold tracking-tighter text-xl hidden sm:inline-block">AGENT OS</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-muted-foreground uppercase tracking-widest">
             <a href="#how" className="hover:text-primary transition-colors">How It Works</a>
             <a href="#features" className="hover:text-primary transition-colors">Features</a>
             <a href="#comparison" className="hover:text-primary transition-colors">Comparison</a>
             <a href="#demo" className="hover:text-primary transition-colors">Live Demo</a>
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
             <Link
               href="/workspace"
               className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]"
             >
               Explore OS
             </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section — Flagship Entrance */}
      <header className="relative min-h-[110vh] lg:min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-visible">
        {/* Subtle Ambient Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.02),transparent_70%)] pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
           <AgentOSTitle />
           
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.5, duration: 1.2 }}
             className="mt-4 max-w-3xl"
           >
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-12">
                 The first high-fidelity reasoning layer that turns raw natural language into structured, build-ready prompt geometry. Built for teams who refuse to settle for LLM hallucinations.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                 <Link
                   href="/workspace"
                   className="group relative px-10 py-4 rounded-full bg-foreground text-background font-bold uppercase text-xs tracking-[0.2em] overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl"
                 >
                   <span className="relative z-10 flex items-center gap-2 text-background">Initialize Workspace <ArrowRight className="size-4" /></span>
                   <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </Link>
                 <button className="text-muted-foreground hover:text-foreground font-medium text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                    Watch Product Vision <ChevronRight className="size-4" />
                 </button>
              </div>
           </motion.div>
        </div>

        {/* Hero Visual — Integrated Orb */}
        <div className="w-full relative mt-16 max-w-5xl mx-auto h-[400px]">
           <AgentOSOrb />
        </div>

        <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-12 text-muted-foreground"
          >
             <ArrowDown className="size-6" />
          </motion.div>
      </header>

      {/* 3. Problem Statement — The GAP */}
      <section className="py-32 container mx-auto px-6 max-w-6xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-8">
              <span className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80 mb-4 inline-block">01. The Problem</span>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Raw Prompting is <br/><span className="text-muted-foreground">the Bottleneck.</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                 Standard LLMs are powerful but volatile. When you give an AI a vague idea, it guesses. This leads to broken logic, redundant iterations, and expensive engineering wasted on "prompt hacking."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   { label: "Instruction Drift", val: "AIs drift from constraints as ideas grow complex." },
                   { label: "Logic Hallucination", val: "Silent errors appear when structure is undefined." }
                 ].map((item, i) => (
                   <div key={i} className="p-4 border-l-2 border-border bg-muted/10">
                      <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">{item.label}</h4>
                      <p className="text-xs text-muted-foreground leading-normal">{item.val}</p>
                   </div>
                 ))}
              </div>
           </div>
           <div className="relative group p-12 bg-card rounded-3xl border border-border overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05),transparent_80%)]" />
              <BarChart3 className="size-48 text-muted/20 absolute -right-12 -bottom-12 group-hover:rotate-12 transition-transform duration-1000" />
              <div className="text-center space-y-4 relative z-10">
                 <div className="text-6xl font-black tracking-tighter text-destructive/80">42%</div>
                 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Average engineering time <br/> lost to prompt refinement</p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. The Solution — AgentOS Intent */}
      <section className="py-32 bg-muted/10 border-y border-border">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
               <span className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80 inline-block">02. Our Solution</span>
               <h2 className="text-4xl md:text-5xl font-bold">Bridging the Gap with <br/>Intelligence Scaffolding.</h2>
               <p className="text-muted-foreground text-lg leading-relaxed">
                  AgentOS isn't just a chat box. It's a structured reasoning engine that forces clarification, validates logic, and builds a robust architectural blueprint before a single line of code is prompted.
               </p>
            </div>
            {/* Visual Flow Representation */}
            <div className="h-[400px] w-full border border-border rounded-3xl bg-background overflow-hidden relative group">
               <div className="absolute top-8 left-8 z-20 space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Automated Reasoning Swarm</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-6">Visualizing active pipeline logic</p>
               </div>
               <MultiAgentFlow />
            </div>
         </div>
      </section>

      {/* 5. Features — Surgical Precision */}
      <section id="features" className="py-32 container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl space-y-4">
               <span className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80 inline-block">03. Key Features</span>
               <h2 className="text-4xl font-bold">Built for Architectural <br/>Clarity and Speed.</h2>
            </div>
            <button className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2 hover:text-foreground transition-colors">
               Explore Full Capability <ArrowRight size={14} className="text-primary" />
            </button>
         </div>
         <FeatureCards />
      </section>

      {/* 6. How It Works — The Pipeline */}
      <section id="how" className="py-32 bg-background relative">
         <div className="container mx-auto px-6 max-w-6xl text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Idea-to-Prompt Logic in <br/><span className="text-muted-foreground">Three Surgical Phases.</span></h2>
         </div>
         <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { id: "01", t: "Ingest & Intent", d: "Raw natural language is captured and refined through our Clarification Engine to resolve ambiguity." },
              { id: "02", t: "Reasoning Swarm", d: "Four specialized agents (Analyst, Strategist, Architect, Engineer) build a cross-validated strategy." },
              { id: "03", t: "Synthesis & Export", d: "Decisions are rendered into a high-fidelity 'Build Prompt' ready for any modern IDE or agent." }
            ].map((step, i) => (
              <div key={i} className="relative group transition-all">
                 <div className="text-7xl font-black text-muted/20 group-hover:text-primary/10 transition-colors absolute -top-8 -left-4 select-none">{step.id}</div>
                 <div className="relative pt-8 space-y-4">
                    <h3 className="text-xl font-bold">{step.t}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.d}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* 7. Comparison — The OS Advantage */}
      <section id="comparison" className="py-32 border-t border-border">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-20 space-y-4">
               <span className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80 inline-block">04. Comparison</span>
               <h2 className="text-3xl md:text-4xl font-bold">Why Architect, when you <br/>can just Prompt?</h2>
               <p className="text-muted-foreground max-w-2xl mx-auto">Compare the output quality and structural integrity between raw LLM prompting and the AgentOS Reasoning Pipeline.</p>
            </div>
            <ComparisonTable />
         </div>
      </section>

      {/* 8. Live Demo — Try the Swarm */}
      <section id="demo" className="py-32 container mx-auto px-6 max-w-7xl">
         <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
               <div className="space-y-4">
                  <span className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] font-mono opacity-80 inline-block">05. Live Preview</span>
                  <h2 className="text-4xl md:text-5xl font-bold font-sans">Experience the <br/>Intelligence Layer.</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                     Watch our reasoning swarm in action as it deconstructs a vague project idea into a complete engineering plan in mere seconds.
                  </p>
               </div>
               <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, t: "End-to-End Validation", d: "No hallucinations allowed in the core prompt." },
                    { icon: Globe, t: "Cross-Platform Readiness", d: "Prompts ready for Cursor, Bolt, or Replit." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                       <div className="p-2 border border-border group-hover:border-primary transition-colors bg-muted/10 rounded-lg">
                          <item.icon className="size-4 text-primary" />
                       </div>
                       <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest mb-1">{item.t}</h4>
                          <p className="text-xs text-muted-foreground leading-normal">{item.d}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 w-full max-w-4xl relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-20 pointer-events-none" />
              <div className="relative h-[650px] w-full rounded-[2rem] border border-border bg-card overflow-hidden shadow-2xl transition-all hover:border-primary/20">
                 <div className="absolute top-0 left-0 w-full h-12 bg-muted/10 border-b border-border flex items-center px-6 gap-2 shrink-0 overflow-hidden">
                    <div className="flex gap-1.5 mr-4">
                       <div className="size-2 rounded-full bg-border" />
                       <div className="size-2 rounded-full bg-border" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-[0.3em] uppercase">Refinement_Engine_v4.0</span>
                 </div>
                 <div className="h-[calc(100%-48px)] mt-12 bg-background flex flex-col overflow-hidden">
                    <AgentOSWorkspaceMock />
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* 9. Testimonials / Trust Section */}
      <section className="py-32 border-t border-border bg-muted/5">
         <div className="container mx-auto px-6 max-w-7xl flex flex-col items-center">
            <h3 className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase mb-16 text-center">Built used by forward-thinking engineers from</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="h-8 w-32 bg-muted text-center flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em] rounded-md border border-border">
                   Company_{i}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 10. Footer — Final Call */}
      <footer className="py-32 bg-card border-t border-border">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row justify-between gap-20">
               <div className="max-w-md space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">A</div>
                    <span className="font-bold tracking-tighter text-2xl">AGENT OS</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                     Modernizing the way AI instructions are engineered. From idea to structure, structure to prompt, prompt to reality. AgentOS is the missing layer in the agentic revolution.
                  </p>
                  <div className="flex gap-6">
                     <a href="#" className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <TerminalIcon size={14} />
                     </a>
                     <a href="#" className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare size={14} />
                     </a>
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-[13px]">
                  <div className="space-y-4">
                     <h4 className="font-bold uppercase tracking-widest text-xs">Product</h4>
                     <ul className="space-y-2 text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Workspace</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Reasoning Engine</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
                     </ul>
                  </div>
                  <div className="space-y-4">
                     <h4 className="font-bold uppercase tracking-widest text-xs">Resources</h4>
                     <ul className="space-y-2 text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Prompt Guides</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Open Source</a></li>
                     </ul>
                  </div>
                  <div className="space-y-4">
                     <h4 className="font-bold uppercase tracking-widest text-xs">Legal</h4>
                     <ul className="space-y-2 text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                     </ul>
                  </div>
               </div>
            </div>
            
            <div className="mt-20 pt-8 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground uppercase tracking-widest font-mono">
               <span>&copy; 2026 Agentic Innovation Labs PDX.</span>
               <div className="flex gap-2 items-center">
                  <div className="size-1.5 rounded-full bg-green-500" />
                  <span>All Nodes Operational</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
