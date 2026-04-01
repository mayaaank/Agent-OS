'EOF'
// =============================================================================
// Agent OS — Pipeline API Route
// =============================================================================
// PHASE 2: projectId passed through to runFullPipeline for server-side persistence.
// PHASE 3: Accepts optional feedback + restartFrom for partial re-runs.

import { NextRequest, NextResponse } from "next/server";
import { runFullPipeline } from "@/agents/orchestrator";
import { runFeedbackIntegrator } from "@/agents/feedback-integrator";
import { buildAgentContext } from "@/lib/memory/agent-context";
import { logger, generateTraceId } from "@/lib/logger";
import {
  getAgentOutputsAction,
} from "@/actions/db";
import type { ChatMessage, AgentName } from "@/types";

export async function POST(req: NextRequest) {
  const traceId = req.headers.get("x-trace-id") ?? generateTraceId();

  logger.info("Pipeline route called", undefined, traceId);

  try {
    const body = await req.json();
    const {
      messages,
      projectId,
      rawIdea,
      // PHASE 3: optional feedback params
      feedback,
      restartFrom,
    } = body as {
      messages: ChatMessage[];
      projectId?: string;
      rawIdea?: string;
      feedback?: string;           // user's feedback text
      restartFrom?: AgentName;     // explicit override (skips Feedback Integrator)
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    if (messages.length > 50) {
      return NextResponse.json(
        { error: "Too many messages — maximum 50 allowed" },
        { status: 400 }
      );
    }

    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalChars > 50_000) {
      return NextResponse.json(
        { error: "Conversation context too large" },
        { status: 400 }
      );
    }

    // ── PHASE 3: Feedback-driven partial re-run ──────────────────────────────
    if (feedback && projectId) {
      logger.info(
        "Pipeline route: feedback re-run requested",
        { feedbackLength: feedback.length, restartFrom },
        traceId
      );

      // Build a temporary context to run the Feedback Integrator
      const tempContext = buildAgentContext(
        projectId,
        rawIdea ?? "",
        messages,
        traceId
      );

      // Load existing agent outputs to give Feedback Integrator context
      const existingOutputsMap = await getAgentOutputsAction(projectId);
      if (existingOutputsMap) {
        tempContext.requirementOutput = existingOutputsMap.requirement_analyst as any;
        tempContext.strategyOutput = existingOutputsMap.product_strategist as any;
        tempContext.architectureOutput = existingOutputsMap.technical_architect as any;
      }

      // If restartFrom is explicitly passed, skip the Feedback Integrator
      let effectiveRestartFrom: AgentName = restartFrom ?? "requirement_analyst";
      let injectedContext = "";

      if (!restartFrom && feedback) {
        // Run Feedback Integrator to decide restart point
        const feedbackAnalysis = await runFeedbackIntegrator(
          tempContext,
          feedback
        );
        effectiveRestartFrom = feedbackAnalysis.restartFrom;
        injectedContext = feedbackAnalysis.injectedContext;

        logger.info(
          "Feedback Integrator decision",
          {
            restartFrom: effectiveRestartFrom,
            injectedContext,
          },
          traceId
        );
      }

      // Run partial pipeline from the determined restart point
      const result = await runFullPipeline(messages, traceId, projectId, rawIdea, {
        restartFrom: effectiveRestartFrom,
        injectedContext,
        existingContext: existingOutputsMap
          ? {
            requirementOutput: existingOutputsMap.requirement_analyst as any,
            strategyOutput: existingOutputsMap.product_strategist as any,
            architectureOutput: existingOutputsMap.technical_architect as any,
          }
          : undefined,
      });

      logger.info("Partial pipeline re-run completed", undefined, traceId);

      return NextResponse.json(result, {
        headers: { "x-trace-id": traceId },
      });
    }

    // ── Normal full pipeline run ─────────────────────────────────────────────
    const result = await runFullPipeline(messages, traceId, projectId, rawIdea);

    logger.info("Pipeline route completed successfully", undefined, traceId);

    return NextResponse.json(result, {
      headers: { "x-trace-id": traceId },
    });
  } catch (error) {
    logger.error(
      "Pipeline route unhandled error",
      { error: error instanceof Error ? error.message : String(error) },
      traceId
    );
    return NextResponse.json(
      { error: "Failed to run agent pipeline" },
      { status: 500 }
    );
  }
}