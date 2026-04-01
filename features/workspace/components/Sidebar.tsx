// ===========================================
// Agent OS — Sidebar Component (Tech Style)
// ===========================================
import { Loader2, CheckCircle2, Sparkles, Plus, RotateCcw, LayoutDashboard, UserCircle, Cpu, Network, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Project } from "@/types";
import type { AgentStatus, WorkspacePhase } from "@/types/workspace";

interface SidebarProps {
  phase: WorkspacePhase;
  projectId: string | null;
  pastProjects: Project[];
  agentStatuses: AgentStatus[];
  messageCount: number;
  onNewProject: () => void;
  onSelectProject: (id: string, idea: string) => void;
  onGenerateNow: () => void;
  onRetryPipeline: () => void;
}

export function Sidebar({
  phase,
  projectId,
  pastProjects,
  agentStatuses,
  messageCount,
  onNewProject,
  onSelectProject,
  onGenerateNow,
  onRetryPipeline,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#1f1f1f] p-6 hidden lg:flex flex-col gap-8 bg-[#111] font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-slate-500">
           <LayoutDashboard className="size-4" />
           <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Explorer</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs rounded-xl h-10 border-[#333] bg-[#0a0a0a] text-white hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
          onClick={onNewProject}
        >
          <Plus className="size-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-10 overflow-hidden">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1 mb-4">
            Projects
          </h4>
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {pastProjects.length === 0 ? (
               <div className="px-4 py-6 text-[11px] text-slate-600 rounded-xl border border-[#222] bg-[#0a0a0a] text-center">
                  No projects yet
               </div>
            ) : pastProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id, p.idea_raw)}
                className={`group w-full text-left px-4 py-2.5 text-[13px] rounded-xl transition-all border flex items-center gap-3 ${
                  projectId === p.id
                    ? "bg-[#1f1f1f] text-white border-[#333] shadow-sm font-medium"
                    : "hover:bg-[#18181b] text-slate-500 hover:text-slate-300 border-transparent"
                }`}
              >
                <div className={`size-1.5 rounded-full shrink-0 transition-all ${projectId === p.id ? 'bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'bg-[#333]'}`} />
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1 mb-4">
            Active Session
          </h4>
          <div className="space-y-3">
            {agentStatuses.map((agent, i) => (
              <div
                key={agent.name}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                   agent.status === "running" ? "bg-[#0a0a0a] border-[#00f0ff]/20" : "border-transparent text-slate-500"
                }`}
              >
                  <div className={`size-10 rounded-xl bg-[#0a0a0a] border flex items-center justify-center transition-all ${
                     agent.status === 'done' ? 'border-[#00f0ff]/30 shadow-sm' : 
                     agent.status === 'running' ? 'border-[#00f0ff]/50 shadow-md' : 
                     'border-[#222]'
                  }`}>
                    {i === 0 && <Cpu className={`size-5 ${agent.status === 'pending' ? 'text-slate-700' : 'text-[#00f0ff] opacity-80'}`} />}
                    {i === 1 && <Network className={`size-5 ${agent.status === 'pending' ? 'text-slate-700' : 'text-[#00f0ff] opacity-80'}`} />}
                    {i === 2 && <Layers className={`size-5 ${agent.status === 'pending' ? 'text-slate-700' : 'text-[#00f0ff] opacity-80'}`} />}
                    {i === 3 && <Sparkles className={`size-5 ${agent.status === 'pending' ? 'text-slate-700' : 'text-[#00f0ff] opacity-80'}`} />}
                  </div>
                
                <div className="flex flex-col min-w-0">
                  <span className={`text-[13px] transition-colors ${
                     agent.status === "done" ? "text-slate-300" : agent.status === "running" ? "text-white font-semibold" : "text-slate-600"
                  }`}>
                    {agent.name}.ts
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        agent.status === 'running' ? 'text-[#00f0ff]' : 
                        agent.status === 'done' ? 'text-green-500/60' : 'text-slate-700'
                     }`}>
                        {agent.status === 'running' ? 'ANALYZING...' : agent.status}
                     </span>
                  </div>
                </div>
                
                {agent.status === "done" && (
                   <CheckCircle2 className="size-4 text-green-500/40 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-[#1f1f1f] space-y-4">
        {phase === "chatting" && messageCount >= 4 && (
          <Button
            size="sm"
            onClick={onGenerateNow}
            className="w-full font-bold rounded-xl h-12 uppercase tracking-widest bg-white text-black hover:bg-slate-200 transition-all shadow-lg"
          >
            <Sparkles className="size-4 mr-2" />
            Generate
          </Button>
        )}

        {phase === "error" && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onRetryPipeline}
            className="w-full rounded-xl font-bold h-12 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20"
          >
            <RotateCcw className="size-4 mr-2" />
            Retry
          </Button>
        )}

        <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1f1f1f] flex items-center gap-3">
           <div className="size-8 rounded-lg bg-[#111] flex items-center justify-center border border-[#222]">
              <UserCircle className="size-5 text-slate-500" />
           </div>
           <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">Builder Session</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wide">Developer Tier</span>
           </div>
        </div>
      </div>
    </aside>
  );
}

