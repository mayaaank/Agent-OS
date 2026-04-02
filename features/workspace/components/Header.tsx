// ===========================================
// Agent OS — Header Component (SunHacks Aesthetic)
// ===========================================
import { BrainCircuit, Plus, ArrowLeft, Radio } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { WorkspacePhase } from "@/types/workspace";

const PHASE_LABELS: Record<WorkspacePhase, string> = {
  idea: "New Project",
  chatting: "Gathering Requirements",
  processing: "Agents Processing...",
  done: "Prompt Ready",
  error: "Pipeline Error",
};

interface HeaderProps {
  phase: WorkspacePhase;
  onNewProject: () => void;
}

export function Header({ phase, onNewProject }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-8 border-b border-border bg-background shrink-0 z-50 font-sans">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all group">
          <div className="size-8 bg-muted border border-border rounded-lg flex items-center justify-center shadow-sm">
            <BrainCircuit className="size-5 text-[#00f0ff] opacity-80" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground">AgentOS</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase -mt-0.5">Interpreter v4.2</span>
          </div>
        </Link>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-3">
          <div className={`size-2 rounded-full ${phase === 'processing' ? 'bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]' : 'bg-muted-foreground/30'}`} />
          <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">{PHASE_LABELS[phase]}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors text-[11px] font-bold uppercase tracking-widest px-4">
            <ArrowLeft className="size-3.5 mr-2" />
            Portal
          </Button>
        </Link>
        {phase !== "idea" && (
          <Button
            onClick={onNewProject}
            className="px-6 h-10 rounded-full text-[11px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all"
          >
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        )}
      </div>
    </header>
  );
}
