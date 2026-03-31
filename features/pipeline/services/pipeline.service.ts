// ===========================================
// Agent OS — Pipeline Service
// ===========================================
// Handles communication with /api/pipeline and saves the result to DB.

import type { ChatMessage } from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import { saveAgentOutputAction, saveFinalPromptAction } from "@/actions/db";
import { formatFinalPrompt } from "@/utils/format-prompt";
import { logger } from "@/lib/logger";

export type AgentStatusUpdater = (
  index: number,
  status: "pending" | "running" | "done"
) => void;

// Detect whether the orchestrator is signalling pipeline readiness
export function shouldTriggerPipeline(content: string): boolean {
  const lower = content.toLowerCase();
  return (
    lower.includes("enough information") || lower.includes("generate your")
  );
}

export async function runPipelineRequest(
  messages: ChatMessage[],
  onStatusUpdate: AgentStatusUpdater,
  projectId: string | null
): Promise<{ result: PipelineResult; markdown: string }> {
  try {
    // Animate agent statuses one-by-one while real API call runs
    for (let i = 0; i < 4; i++) {
        onStatusUpdate(i, "running");
        await new Promise((r) => setTimeout(r, 800));
    }

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
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

    // Orchestrate persistence step exclusively in the service layer
    if (projectId) {
      // Intentionally not awaiting all of these fully to avoid blocking the UI,
      // but wrapping them to handle any errors silently without failing the core return.
      Promise.all([
        saveAgentOutputAction(projectId, "requirement_analyst", result.requirements),
        saveAgentOutputAction(projectId, "product_strategist", result.strategy),
        saveAgentOutputAction(projectId, "technical_architect", result.architecture),
        saveFinalPromptAction(projectId, markdown),
      ]).catch((err) => {
          logger.error("Failed to persist pipeline output to DB", { error: err.message, projectId });
      });
    }

    return { result, markdown };
  } catch (error) {
    logger.error("Pipeline service failed", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
