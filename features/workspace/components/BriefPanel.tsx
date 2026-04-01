// ===========================================
// Agent OS — BriefPanel Component (Tech Style)
// ===========================================
import {
  Copy, Download, RotateCcw, CheckCircle2, FileText, AlertCircle, Layout, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import type { PipelineResult } from "@/agents/orchestrator";
import type { WorkspacePhase } from "@/types/workspace";

// ── Section helper ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] opacity-40" />
        {title}
      </h3>
      <div className="bg-[#111] p-6 rounded-2xl border border-[#222] relative overflow-hidden group shadow-sm transition-all hover:border-[#333]">
         {children}
      </div>
    </div>
  );
}

// ── Brief content ───────────────────────────────────────────

function BriefContent({ result }: { result: PipelineResult }) {
  const { requirements, strategy, architecture, finalPrompt } = result;
  return (
    <div className="space-y-10 text-sm">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">{finalPrompt.product_name}</h2>
        <p className="text-slate-500 leading-relaxed font-medium italic">"{finalPrompt.concept}"</p>
      </div>
      
      <Separator className="bg-[#1f1f1f]" />
      
      <Section title="Problem Statement">
        <p className="text-slate-300 leading-relaxed text-[13px] font-medium">{requirements.problem_statement}</p>
      </Section>
      
      <Section title="Critical Goals">
        <div className="flex flex-wrap gap-2">
          {requirements.goals.map((g) => (
            <Badge key={g} variant="outline" className="text-[11px] font-bold border-[#333] bg-[#0a0a0a] text-slate-400 px-3 py-1 rounded-full">
              {g}
            </Badge>
          ))}
        </div>
      </Section>
      
      <Section title="MVP Feature Pipeline">
        <div className="space-y-4">
          {strategy.feature_priorities.map((f, i) => (
            <div key={f.feature} className="flex items-center gap-4">
              <div className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-widest ${
                 f.priority === "must" ? "bg-[#1f1f1f] border-[#333] text-[#00f0ff]" : "bg-[#0a0a0a] border-[#222] text-slate-600"
              }`}>
                {f.priority.toUpperCase()}
              </div>
              <span className="text-slate-300 text-[13px] font-medium">{f.feature}</span>
            </div>
          ))}
        </div>
      </Section>
      
      <Section title="Suggested Technology Stack">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(architecture.suggested_stack).map(([key, val]) => (
            <div key={key} className="rounded-xl border border-[#222] bg-[#0a0a0a] p-4 group transition-all hover:border-[#00f0ff]/20">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600 mb-1">{key}</p>
              <p className="text-[12px] font-semibold text-white truncate">{val}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────

interface BriefPanelProps {
  phase: WorkspacePhase;
  pipelineResult: PipelineResult | null;
  finalMarkdown: string;
  activeTab: "brief" | "prompt";
  copied: boolean;
  onTabChange: (tab: "brief" | "prompt") => void;
  onCopy: () => void;
  onExport: () => void;
  onRegenerate: () => void;
}

export function BriefPanel({
  phase,
  pipelineResult,
  finalMarkdown,
  activeTab,
  copied,
  onTabChange,
  onCopy,
  onExport,
  onRegenerate,
}: BriefPanelProps) {
  const isDone = (phase === "done" || phase === "chatting") && pipelineResult;

  return (
    <aside className="w-[480px] border-l border-[#1f1f1f] hidden xl:flex flex-col bg-[#0a0a0a] relative z-20 overflow-hidden font-sans">
      {isDone ? (
        <>
          {/* Tabs */}
          <div className="flex items-center border-b border-[#1f1f1f] px-6 h-14 shrink-0 bg-[#0a0a0a]">
            {(["brief", "prompt"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`relative h-full px-6 text-[11px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "text-[#00f0ff]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "brief" ? "Structured Brief" : "Master Prompt"}
                {activeTab === tab && (
                   <motion.div layoutId="briefTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#00f0ff]" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 relative isolate">
            {activeTab === "brief" ? (
              <BriefContent result={pipelineResult} />
            ) : (
              <div className="markdown-content text-[15px] leading-[1.6] bg-[#111] p-8 rounded-2xl border border-[#222] shadow-sm text-slate-300">
                <ReactMarkdown>{finalMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 border-t border-[#1f1f1f] bg-[#0a0a0a] flex gap-3 z-10 shrink-0">
            <Button variant="default" size="sm" className="flex-1 h-12 rounded-full font-bold text-[11px] uppercase tracking-widest bg-white text-black hover:bg-slate-200 transition-all shadow-lg" onClick={onCopy}>
              {copied ? (
                <CheckCircle2 className="size-4 mr-2" />
              ) : (
                <Copy className="size-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy Prompt"}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-12 rounded-full font-bold text-[11px] uppercase tracking-widest border-[#333] bg-[#111] text-white hover:bg-[#1f1f1f] shadow-sm transition-all" onClick={onExport}>
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="ghost" size="sm" className="h-12 w-12 rounded-full text-slate-500 hover:text-white hover:bg-[#111] transition-all" onClick={onRegenerate}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0a0a0a] overflow-hidden relative">
            <div className="relative mb-12 z-10">
               <div className="size-20 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center shadow-lg group transition-transform hover:scale-105">
                 {phase === "error" ? (
                   <AlertCircle className="size-10 text-red-500/60" />
                 ) : (
                   <FileText className="size-10 text-slate-600 group-hover:text-[#00f0ff] transition-all" />
                 )}
               </div>
               {phase === "processing" && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-xl ring-4 ring-[#0a0a0a]">
                     <Sparkles className="size-4 text-black animate-pulse" />
                  </div>
               )}
            </div>
            
            <div className="space-y-6 max-w-sm z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {phase === "processing" ? "Aggregating Spec..." : 
                 phase === "error" ? "System Interruption" : 
                 "Processor Engine"}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {phase === "processing" ? "The distributed build engine is currently analyzing your conversation to distill the final build prompt." : 
                 phase === "error" ? "The pipeline encountered a reasoning block. Your data is cached and ready for a retry sequence." : 
                 "Your structured technical brief will be generated here once enough requirements have been confirmed."}
              </p>
            </div>

            {phase === "chatting" && (
              <div className="mt-16 w-full max-w-[240px] space-y-4 z-10">
                 <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#00f0ff] opacity-40">
                    <span>Engine Status</span>
                    <span>Ready</span>
                 </div>
                 <div className="w-full h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00f0ff] opacity-20 w-full animate-pulse" />
                 </div>
              </div>
            )}
        </div>
      )}
    </aside>
  );
}

