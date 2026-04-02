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
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] opacity-40" />
        {title}
      </h3>
      <div className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden group shadow-sm transition-all hover:border-border/80">
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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{finalPrompt.product_name}</h2>
        <p className="text-muted-foreground leading-relaxed font-medium italic">"{finalPrompt.concept}"</p>
      </div>

      <Separator className="bg-border" />

      <Section title="Problem Statement">
        <p className="text-foreground/90 leading-relaxed text-[13px] font-medium">{requirements.problem_statement}</p>
      </Section>

      <Section title="Critical Goals">
        <div className="flex flex-wrap gap-2">
          {requirements.goals.map((g) => (
            <Badge key={g} variant="outline" className="text-[11px] font-bold border-border bg-background text-muted-foreground px-3 py-1 rounded-full">
              {g}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="MVP Feature Pipeline">
        <div className="space-y-4">
          {strategy.feature_priorities.map((f, i) => (
            <div key={f.feature} className="flex items-center gap-4">
              <div className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-widest ${f.priority === "must" ? "bg-muted border-border text-[#00f0ff]" : "bg-background border-border text-muted-foreground"
                }`}>
                {f.priority.toUpperCase()}
              </div>
              <span className="text-foreground/90 text-[13px] font-medium">{f.feature}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Suggested Technology Stack">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(architecture.suggested_stack).map(([key, val]) => (
            <div key={key} className="rounded-xl border border-border bg-background p-4 group transition-all hover:border-[#00f0ff]/20">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">{key}</p>
              <p className="text-[12px] font-semibold text-foreground truncate">{val}</p>
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
    <aside className="w-[480px] border-l border-border hidden xl:flex flex-col bg-background relative z-20 overflow-hidden font-sans">
      {isDone ? (
        <>
          {/* Tabs */}
          <div className="flex items-center border-b border-border px-6 h-14 shrink-0 bg-background">
            {(["brief", "prompt"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`relative h-full px-6 text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
                    ? "text-[#00f0ff]"
                    : "text-muted-foreground hover:text-foreground"
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
              <div className="markdown-content text-[15px] leading-[1.6] bg-card p-8 rounded-2xl border border-border shadow-sm text-foreground/90">
                <ReactMarkdown>{finalMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 border-t border-border bg-background flex gap-3 z-10 shrink-0">
            <Button variant="default" size="sm" className="flex-1 h-12 rounded-full font-bold text-[11px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg" onClick={onCopy}>
              {copied ? (
                <CheckCircle2 className="size-4 mr-2" />
              ) : (
                <Copy className="size-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy Prompt"}
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-12 rounded-full font-bold text-[11px] uppercase tracking-widest border-border bg-card text-foreground hover:bg-muted shadow-sm transition-all" onClick={onExport}>
              <Download className="size-4 mr-2" /> Export
            </Button>
            <Button variant="ghost" size="sm" className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all" onClick={onRegenerate}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center dark:bg-[#0a0a0a] bg-white overflow-hidden relative">
          <div className="relative mb-12 z-10">
            <div className="size-20 rounded-2xl dark:bg-[#111] bg-zinc-100 border dark:border-[#222] border-zinc-200 flex items-center justify-center shadow-lg group transition-transform hover:scale-105">
              {phase === "error" ? (
                <AlertCircle className="size-10 text-red-500/60" />
              ) : (
                <FileText className="size-10 dark:text-slate-600 text-zinc-400 group-hover:text-[#00f0ff] transition-all" />
              )}
            </div>
            {phase === "processing" && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-white dark:text-black text-zinc-900 rounded-full p-2 shadow-xl ring-4 dark:ring-[#0a0a0a] ring-white">
                <Sparkles className="size-4 text-black dark:text-black animate-pulse" />
              </div>
            )}
          </div>

          <div className="space-y-6 max-w-sm z-10">
            <h3 className="text-2xl font-bold dark:text-white text-zinc-900 tracking-tight">
              {phase === "processing" ? "Aggregating Spec..." :
                phase === "error" ? "System Interruption" :
                  "Processor Engine"}
            </h3>
            <p className="text-sm dark:text-slate-500 text-zinc-500 leading-relaxed font-medium">
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
              <div className="w-full h-1 dark:bg-[#1f1f1f] bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#00f0ff] opacity-20 w-full animate-pulse" />
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

