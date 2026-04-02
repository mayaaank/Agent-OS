// ===========================================
// Agent OS — IdeaInput Component (SunHacks Aesthetic)
// ===========================================
import { useRef } from "react";
import { Sparkles, ArrowRight, Loader2, Folder, Zap, MessageSquareCode } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

interface IdeaInputProps {
  rawIdea: string;
  onIdeaChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  pastProjects: Project[];
  isLoadingHistory: boolean;
  onSelectProject: (id: string, idea: string) => void;
}

export function IdeaInput({
  rawIdea,
  onIdeaChange,
  onSubmit,
  onKeyDown,
  pastProjects,
  isLoadingHistory,
  onSelectProject,
}: IdeaInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden bg-background font-sans">
      {/* Recent projects sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-border dark:flex-col flex-col bg-sidebar relative z-10">
        <div className="p-6 border-b border-border flex items-center gap-3">
           < Zap className="size-4 text-muted-foreground" />
           <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
             Project Archive
           </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoadingHistory ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : pastProjects.length === 0 ? (
            <div className="px-6 py-10 text-center bg-card rounded-2xl border border-border">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest leading-loose">
                Your past projects will appear here.
              </p>
            </div>
          ) : (
            pastProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id, p.idea_raw)}
                className="w-full text-left px-5 py-4 text-[13px] rounded-xl transition-all border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-background border border-border dark:flex items-center justify-center shrink-0 transition-all text-muted-foreground group-hover:border-accent/30 group-hover:text-accent">
                    <Folder className="size-4" />
                  </div>
                  <span className="truncate font-medium text-foreground">{p.title}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Idea input */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="w-full max-w-4xl space-y-12 relative z-10">
          <div className="flex flex-col items-center text-center space-y-10">
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-3xl bg-muted border border-border flex items-center justify-center shadow-inner group hover:scale-105 transition-transform">
                <Sparkles className="size-8 text-[#00f0ff] opacity-80" />
              </div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.4em]">Ready Phase 01</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                What are we <span className="text-[#00f0ff]">building</span> today?
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                Describe your concept in plain language. Our multi-agent cluster will interpret your logic and refine it into a build-ready technical prompt.
              </p>
            </div>
          </div>

          <div className="relative group max-w-2xl mx-auto w-full">
            <div className="relative bg-background rounded-[32px] border border-border p-3 shadow-2xl focus-within:border-accent/40 transition-all">
              <Textarea
                ref={textareaRef}
                value={rawIdea}
                onChange={(e) => onIdeaChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="E.g., A multi-tenant SaaS platform for team management..."
                className="min-h-[180px] w-full bg-transparent border-none text-foreground text-lg placeholder:text-muted-foreground/50 resize-none rounded-[28px] focus-visible:ring-0 px-8 py-6 transition-all font-medium leading-[1.6]"
              />
              <div className="px-8 pb-6 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70 font-bold uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                   <span>Project Draft</span>
                </div>
                <Button 
                   onClick={onSubmit} 
                   disabled={!rawIdea.trim()}
                   className="bg-muted hover:bg-accent hover:text-white text-foreground px-10 h-14 rounded-full font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-lg group"
                >
                  TRANSMIT <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
