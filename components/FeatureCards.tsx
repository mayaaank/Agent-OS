"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Code2, Zap } from "lucide-react";

const features = [
  {
    title: "Requirement Processing",
    description: "Multi-agent chains that extract precise technical constraints from vague natural language inputs.",
    icon: Brain,
  },
  {
    title: "Strategic Blueprinting",
    description: "Automatic generation of product-first engineering strategies and MVP roadmaps.",
    icon: Zap,
  },
  {
    title: "Prompt Synthesis",
    description: "Conversion of architectural decisions into optimized, cross-platform build prompts.",
    icon: Code2,
  },
  {
    title: "Zero-Latency Refinement",
    description: "Iterative feedback loops that ensure every instruction is build-ready without hallucination.",
    icon: Sparkles,
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="p-8 group card-premium relative overflow-hidden"
        >
          <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <feature.icon className="size-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <feature.icon className="size-24" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
