'EOF'
// =============================================================================
// Agent OS — Sidebar Component
// =============================================================================
// PHASE 3: Confidence badges added per agent status.
//          Feedback input panel shown when phase === "done".

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, CheckCircle2, Plus, Sparkles, RotateCcw, SendHorizonal,
} from "lucide-react";
import type { WorkspaceState, WorkspacePhase } from "@/types/workspace";
import type { WorkspaceAction } from "@/types/workspace";
import type { Dispatch } from "react";

interface SidebarProps {
    state: WorkspaceState;
    dispatch: Dispatch<WorkspaceAction>;
    phase: WorkspacePhase;
    pastProjects: { id: string; title: string; idea_raw: string }[];
    onNewProject: () => void;
    onSelectProject: (id: string, idea: string) => void;
    onGenerateNow: () => void;
    onRegenerate: () => void;
    onRetryPipeline: () => void;
    onFeedbackSubmit: () => void;  // PHASE 3
}

// PHASE 3: Colour the confidence badge by score range
function confidenceBadgeClass(score: number): string {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export function Sidebar({
    state,
    dispatch,
    phase,
    pastProjects,
    onNewProject,
    onSelectProject,
    onGenerateNow,
    onRegenerate,
    onRetryPipeline,
    onFeedbackSubmit,
}: SidebarProps) {
    const { agentStatuses, messages, loading, feedbackValue } = state;

    return (
        <aside className="w-56 border-r border-border/50 p-3 hidden lg:flex flex-col gap-3 bg-sidebar/50">

            {/* New project button */}
            <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={onNewProject}
            >
                <Plus className="size-3 mr-1.5" />
                New Project
            </Button>

            {/* Project history */}
            <div className="pt-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-2">
                    My Projects
                </h3>
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                    {pastProjects.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSelectProject(p.id, p.idea_raw)}
                            className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors truncate ${state.projectId === p.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Agent status + PHASE 3: confidence badges */}
            <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-2">
                    Agent Status
                </p>
                {agentStatuses.map((agent) => (
                    <div
                        key={agent.name}
                        className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs"
                    >
                        <div className="flex items-center gap-2">
                            {agent.status === "pending" && (
                                <div className="size-2 rounded-full bg-muted-foreground/30" />
                            )}
                            {agent.status === "running" && (
                                <Loader2 className="size-3 text-primary animate-spin" />
                            )}
                            {agent.status === "done" && (
                                <CheckCircle2 className="size-3 text-green-500" />
                            )}
                            <span
                                className={
                                    agent.status === "done"
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                }
                            >
                                {agent.name}
                            </span>
                        </div>

                        {/* PHASE 3: Confidence badge — only shown when done and score exists */}
                        {agent.status === "done" && agent.confidence !== undefined && (
                            <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${confidenceBadgeClass(agent.confidence)}`}
                            >
                                {agent.confidence}%
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Generate now button */}
            {phase === "chatting" && messages.length >= 4 && (
                <>
                    <Separator />
                    <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs"
                        onClick={onGenerateNow}
                    >
                        <Sparkles className="size-3 mr-1.5" />
                        Generate Now
                    </Button>
                </>
            )}

            {/* Retry button */}
            {phase === "error" && (
                <>
                    <Separator />
                    <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                        onClick={onRetryPipeline}
                    >
                        <RotateCcw className="size-3 mr-1.5" />
                        Retry Pipeline
                    </Button>
                </>
            )}

            {/* PHASE 3: Feedback panel — only shown when pipeline is done */}
            {phase === "done" && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2">
                            Refine Brief
                        </p>
                        <Textarea
                            value={feedbackValue}
                            onChange={(e) =>
                                dispatch({ type: "SET_FEEDBACK_VALUE", payload: e.target.value })
                            }
                            placeholder="e.g. Focus more on mobile users..."
                            className="text-xs min-h-[72px] max-h-[120px] resize-none"
                            disabled={loading.pipeline}
                        />
                        <Button
                            size="sm"
                            className="w-full text-xs"
                            disabled={!feedbackValue.trim() || loading.pipeline}
                            onClick={onFeedbackSubmit}
                        >
                            {loading.pipeline ? (
                                <Loader2 className="size-3 mr-1.5 animate-spin" />
                            ) : (
                                <SendHorizonal className="size-3 mr-1.5" />
                            )}
                            {loading.pipeline ? "Re-running..." : "Re-run with Feedback"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-xs"
                            onClick={onRegenerate}
                            disabled={loading.pipeline}
                        >
                            <RotateCcw className="size-3 mr-1.5" />
                            Full Regenerate
                        </Button>
                    </div>
                </>
            )}
        </aside>
    );
}
