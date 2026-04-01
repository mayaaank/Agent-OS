'EOF'
// =============================================================================
// Agent OS — Pipeline Service
// =============================================================================
// PHASE 3: runPipelineRequest accepts optional feedback + restartFrom
// so useWorkspace can trigger a partial re-run without a full page reset.

import type { ChatMessage, AgentName } from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import { saveFinalPromptAction } from "@/actions/db";
import { formatFinalPrompt } from "@/utils/format-prompt";
import { logger } from "@/lib/logger";

export type AgentStatusUpdater = (
  index: number,
  status: "pending" | "running" | "done"
) => void;

export function shouldTriggerPipeline(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    lower.includes("enough information") ||
    lower.includes("generate your")
  );
}

export interface RunPipelineOptions {
  feedback?: string;        // PHASE 3: user feedback text
  restartFrom?: AgentName;  // PHASE 3: explicit restart point override
  rawIdea?: string;
}

export async function runPipelineRequest(
  messages: ChatMessage[],
  onStatusUpdate: AgentStatusUpdater,
  projectId: string | null,
  options: RunPipelineOptions = {}
): Promise<{ result: PipelineResult; markdown: string }> {
  try {
    // Agent count depends on restart point for partial re-runs
    const agentOrder: AgentName[] = [
      "requirement_analyst",
      "product_strategist",
      "technical_architect",
      "prompt_engineer",
    ];

    const startIndex = options.restartFrom
      ? agentOrder.indexOf(options.restartFrom)
      : 0;
    const effectiveStart = startIndex === -1 ? 0 : startIndex;

    // Animate only the agents that will actually run
    const animateStatuses = async () => {
      for (let i = effectiveStart; i < 4; i++) {
        onStatusUpdate(i, "running");
        await new Promise((r) => setTimeout(r, 800));
      }
    };

    const [, res] = await Promise.all([
      animateStatuses(),
      fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          projectId,
          rawIdea: options.rawIdea,
          // PHASE 3: pass feedback params if present
          ...(options.feedback ? { feedback: options.feedback } : {}),
          ...(options.restartFrom ? { restartFrom: options.restartFrom } : {}),
        }),
      }),
    ]);

    if (!res.ok) {
      const traceId = res.headers.get("x-trace-id");
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        (errBody as { error?: string })?.error ??
        `Pipeline failed (${res.status})${traceId ? ` — TraceID: ${traceId}` : ""}`
      );
    }

    const result = (await res.json()) as PipelineResult;
    const markdown = formatFinalPrompt(result.finalPrompt);

    if (projectId) {
      saveFinalPromptAction(projectId, markdown).catch((err) => {
        logger.error("Failed to persist final prompt", {
          error: err instanceof Error ? err.message : String(err),
          projectId,
        });
      });
    }

    return { result, markdown };
  } catch (error) {
    logger.error("Pipeline service failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}