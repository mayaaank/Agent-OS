"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    label: "Requirement Analysis",
    standard: "Surface-level extraction",
    agentos: "Recursive multi-agent deep analysis",
    check: true,
  },
  {
    label: "Reasoning Depth",
    standard: "Limited context window",
    agentos: "Distributed chain-of-thought layers",
    check: true,
  },
  {
    label: "Code Execution",
    standard: "Manual prompt entry",
    agentos: "Automated, build-ready prompt generation",
    check: true,
  },
  {
    label: "Architectural Precision",
    standard: "No inherent structure",
    agentos: "Baked-in engineering constraints",
    check: true,
  },
];

export default function ComparisonTable() {
  return (
    <div className="w-full flex-1 max-w-4xl mx-auto border border-border rounded-2xl overflow-hidden bg-card text-card-foreground">
      <div className="grid grid-cols-3 bg-muted/30 border-b border-border p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <div>Feature Category</div>
        <div>Standard LLM Output</div>
        <div className="text-primary glow-text">AgentOS Optimized</div>
      </div>
      {categories.map((cat, i) => (
        <motion.div
           key={i}
           initial={{ opacity: 0, x: -10 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ delay: i * 0.1, duration: 0.5 }}
           className="grid grid-cols-3 p-6 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors"
        >
          <div className="text-sm font-semibold">{cat.label}</div>
          <div className="text-xs text-muted-foreground pr-4 flex items-center gap-2">
             <X size={12} className="text-destructive/50" />
             {cat.standard}
          </div>
          <div className="text-xs font-medium flex items-center gap-2">
             <Check size={14} className="text-primary" />
             {cat.agentos}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
