'TYPESCRIPT'
// =============================================================================
// Agent OS — Pipeline Service
// =============================================================================

import type { ChatMessage, AgentName } from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import { isPipelineReady } from "@/agents/orchestrator";
import { saveAgentOutputAction, saveFinalPromptAction } from "@/actions/db";
import { formatFinalPrompt } from "@/utils/format-prompt";
import { logger } from "@/lib/logger";

export type AgentStatusUpdater = (
  index: number,
  status: "pending" | "running" | "done"
) => void;

// Re-export for useWorkspace.ts
export { isPipelineReady as shouldTriggerPipeline };

export interface RunPipelineServiceOptions {
  rawIdea?: string;
  feedback?: string;
  restartFrom?: AgentName;
  previousResult?: PipelineResult;
  /** Only animate agents starting from this index (0-3). Defaults to 0 (all). */
  animateFrom?: number;
}

export async function runPipelineRequest(
  messages: ChatMessage[],
  onStatusUpdate: AgentStatusUpdater,
  projectId: string | null,
  options: RunPipelineServiceOptions = {}
): Promise<{ result: PipelineResult; markdown: string }> {
  const { feedback, previousResult, animateFrom = 0 } = options;

  try {
    // Animate only the agents that will actually run
    for (let i = animateFrom; i < 4; i++) {
      onStatusUpdate(i, "running");
      await new Promise((r) => setTimeout(r, 800));
    }

    const body: Record<string, unknown> = { messages, projectId };
    if (options.rawIdea) body.rawIdea = options.rawIdea;
    if (options.restartFrom) body.restartFrom = options.restartFrom;

    if (feedback && previousResult) {
      body.feedback = feedback;
      body.previousResult = previousResult;
    }

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

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
      Promise.all([
        saveAgentOutputAction(projectId, "requirement_analyst", result.requirements),
        saveAgentOutputAction(projectId, "product_strategist", result.strategy),
        saveAgentOutputAction(projectId, "technical_architect", result.architecture),
        saveFinalPromptAction(projectId, markdown),
      ]).catch((err) =>
        logger.error("Failed to persist pipeline output", { error: err.message, projectId })
      );
    }

    return { result, markdown };
  } catch (error) {
    logger.error("Pipeline service failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}