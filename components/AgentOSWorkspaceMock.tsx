"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileCode, 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Files, 
  Cpu, 
  Search, 
  Settings, 
  Share2, 
  Play,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import dynamic from "next/dynamic";

const DemoChat = dynamic(() => import("./DemoChat"), { ssr: false });

export default function AgentOSWorkspaceMock() {
  const [activeTab, setActiveTab] = useState("pipeline.yml");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // Subtle heartbeat
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const explorerItems = [
    { name: "agent_core", isFolder: true, open: true },
    { name: "pipeline.yml", isFolder: false, active: true },
    { name: "reasoning_steps.ts", isFolder: false, active: false },
    { name: "prompt_templates", isFolder: true, open: false },
    { name: "deployment.sh", isFolder: false, active: false },
  ];

  const codeLines = [
    { label: "Name", value: "AGENT OS PIPELINE", color: "text-[#00f0ff]" },
    { label: "Type", value: "REASONING_SWARM", color: "text-purple-400" },
    { label: "Objective", value: "IDEA_TO_PROMPT_CONVERSION", color: "text-[#00f0ff]" },
    { label: "Status", value: "ACTIVE", color: "text-green-400" },
    { label: "Version", value: "v4.2.0-alpha", color: "text-slate-500" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden rounded-3xl border border-[#1f1f1f] shadow-2xl relative">
      
      {/* 1. Header / Window Controls */}
      <div className="h-11 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between px-4 shrink-0 overflow-hidden">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1.5 mr-4">
             <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
             <div className="size-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
             <div className="size-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 border-l border-white/5">
            <Cpu className="size-3 text-[#00f0ff] opacity-50" />
            <span>AgentOS_Workspace — main</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/5 px-3 py-1 rounded-full border border-[#00f0ff]/10">
            <div className="size-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            <span>Processing Swarm...</span>
          </div>
          <Settings className="size-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Activity Bar) */}
        <div className="w-12 bg-[#080808] border-r border-[#1f1f1f] flex flex-col items-center py-4 gap-6 shrink-0">
           <Files className="size-5 text-[#00f0ff]" />
           <Search className="size-5 text-slate-600 hover:text-slate-400 cursor-pointer" />
           <Settings className="size-5 text-slate-600 hover:text-slate-400 cursor-pointer mt-auto" />
           <Share2 className="size-5 text-slate-600 hover:text-slate-400 cursor-pointer pb-2" />
        </div>

        {/* Left Explorer (Optional width) */}
        <div className="w-56 bg-[#0a0a0a] border-r border-[#1f1f1f] p-4 hidden md:flex flex-col shrink-0">
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Explorer <ChevronRight className="size-3 rotate-90" />
           </h3>
           <div className="space-y-3">
              {explorerItems.map((item, i) => (
                <div key={i} className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${item.active ? 'text-[#00f0ff]' : 'text-slate-500 hover:text-slate-300'} cursor-pointer`}>
                   {item.isFolder ? <Files className="size-3.5 opacity-50" /> : <FileCode className="size-3.5 opacity-50" />}
                   <span className={item.isFolder ? "font-bold" : ""}>{item.name}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Center: Editor + Bottom Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
          
          {/* Tab Bar */}
          <div className="h-10 bg-[#0a0a0a] border-b border-[#1f1f1f] flex shrink-0">
             <div className="px-5 h-full border-r border-[#1f1f1f] bg-[#050505] flex items-center gap-2 text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00f0ff]" />
                <FileCode className="size-3" />
                <span>pipeline.yml</span>
             </div>
             <div className="px-5 h-full border-r border-[#1f1f1f] flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-white/[0.02] cursor-pointer transition-colors">
                <span>deploy.sh</span>
             </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-8 font-mono text-sm overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] bg-[radial-gradient(circle_at_center,#00f0ff_0%,transparent_70%)] pointer-events-none" />
             
             {/* Line Numbers */}
             <div className="flex gap-6">
                <div className="flex flex-col text-slate-700 text-right select-none w-4">
                   {[1, 2, 3, 4, 5, 6, 7].map(n => <div key={n} className="leading-8">{n}</div>)}
                </div>
                <div className="flex flex-col flex-1">
                   {codeLines.map((line, i) => (
                     <div key={i} className="leading-8 flex gap-3 group">
                        <span className="text-white font-bold min-w-[80px]">{line.label}:</span>
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className={`${line.color} drop-shadow-[0_0_8px_currentColor]`}
                        >
                          {line.value}
                        </motion.span>
                     </div>
                   ))}
                   <div className="mt-8">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1f1f1f] p-4 rounded-xl w-fit"
                      >
                         <div className="size-2 rounded-full bg-[#00f0ff] animate-ping" />
                         <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Executing Reasoning Sequence...</span>
                      </motion.div>
                   </div>
                </div>
             </div>

             {/* Simple Background Robot Sprite (Subtle Asset) */}
             <div className="absolute right-12 bottom-12 opacity-10 pointer-events-none grayscale invert hover:grayscale-0 hover:invert-0 transition-all duration-700">
                <Cpu className="size-32" />
             </div>
          </div>

          {/* Bottom Terminal / Output */}
          <div className="h-44 border-t border-[#1f1f1f] bg-[#050505] flex flex-col shrink-0 shrink-0">
             <div className="h-9 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center px-4 gap-6">
                <div className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest border-b border-[#00f0ff] h-full flex items-center px-1">Output</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest h-full flex items-center px-1 hover:text-white transition-colors cursor-pointer">Debug Console</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest h-full flex items-center px-1 hover:text-white transition-colors cursor-pointer">Problems</div>
             </div>
             <div className="flex-1 p-4 font-mono text-[10px] md:text-[11px] leading-relaxed text-slate-500 overflow-y-auto">
                <div className="flex gap-2">
                   <span className="text-[#00f0ff]">AGENT_X</span>
                   <span className="text-white">/ws</span>
                   <span className="opacity-40">Feb 25, 01:10 am</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <div className="px-2 py-0.5 bg-yellow-400 text-black font-bold rounded-sm">AgentOS</div>
                   <div className="px-2 py-0.5 bg-pink-500 text-white font-bold rounded-sm">APR 01, 09:26 PM</div>
                   <span className="text-green-400 ml-2">agentos --init --swarm</span>
                </div>
                <div className="mt-2 text-slate-600">
                   &gt; [SYSTEM] Initializing multi-agent reasoning swarm... Done.<br/>
                   &gt; [SYSTEM] Connected to Analyst, Strategist, Architect nodes.<br/>
                   &gt; [SYSTEM] Analyzing raw linguistic input... <span className="text-[#00f0ff] animate-pulse">IN PROGRESS</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Pane: Agent Workspace (Chat Integration) */}
        <div className="w-full lg:w-[480px] bg-[#0a0a0a] border-l border-[#1f1f1f] flex flex-col shrink-0 shrink-0">
           <div className="h-10 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between px-5 shrink-0 shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                 <AlertCircle className="size-3 text-[#00f0ff]/50" />
                 <span>AGENT_WORKSPACE</span>
              </div>
              <div className="text-[9px] font-bold text-[#00f0ff] uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                 <div className="size-1.5 rounded-full bg-[#00f0ff]" />
                 PROCESSING...
              </div>
           </div>
           <div className="flex-1 overflow-hidden relative">
              <DemoChat />
           </div>
        </div>
      </div>

      {/* 3. Status Bar */}
      <div className="h-6 bg-[#00f0ff]/5 border-t border-[#00f0ff]/10 flex items-center justify-between px-4 shrink-0 text-[9px] font-mono font-bold text-slate-500 overflow-hidden">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 text-[#00f0ff] opacity-80">
              <TerminalIcon className="size-3" />
              <span>main*</span>
           </div>
           <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-green-500" />
              <span>SYNCING...</span>
           </div>
        </div>
        <div className="flex items-center gap-6 pr-2">
           <span>Ln 1, Col 1</span>
           <span>Spaces: 2</span>
           <span className="text-[#00f0ff]">YAML</span>
        </div>
      </div>
    </div>
  );
}
