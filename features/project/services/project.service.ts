'TYPESCRIPT'
// =============================================================================
// Agent OS — Project Service
// =============================================================================
// Wraps project-related server actions.
// Handles localStorage + router side-effects so hooks stay clean.

import {
  createProjectAction,
  getProjectsAction,
  getProjectMessagesAction,
  saveMessagesAction,
  getAgentOutputsAction,
  getFinalPromptAction,
  updateProjectStatusAction,
} from "@/actions/db";
import type { ChatMessage, Project, Message, ProjectStatus } from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import { formatFinalPrompt } from "@/utils/format-prompt";
import { logger } from "@/lib/logger";

// ── Project creation ─────────────────────────────────────────────────────────

export interface CreateProjectResult {
  project: Project;
  newId: string;
}

export async function createProject(
  rawIdea: string
): Promise<CreateProjectResult | null> {
  const title = rawIdea.slice(0, 40) + (rawIdea.length > 40 ? "..." : "");
  try {
    const project = await createProjectAction(title, rawIdea);
    if (!project) return null;

    if (typeof window !== "undefined") {
      localStorage.setItem("agent_os_current_project", project.id);
    }
    return { project, newId: project.id };
  } catch (err) {
    logger.error("Project service: createProject failed", { error: err });
    return null;
  }
}

// ── Project status ───────────────────────────────────────────────────────────

/**
 * Updates project status in Supabase.
 * Call this at lifecycle transitions: gathering → processing → completed.
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  try {
    await updateProjectStatusAction(projectId, status);
  } catch (err) {
    logger.error("Project service: updateProjectStatus failed", {
      error: err,
      projectId,
      status,
    });
  }
}

// ── Project loading ──────────────────────────────────────────────────────────

export interface LoadedProject {
  messages: ChatMessage[];
  hasMessages: boolean;
  pipelineResult: PipelineResult | null;
  finalMarkdown: string;
  isCompleted: boolean;
}

/**
 * FIX: Loads full project context including agent outputs and final prompt.
 * Previously only messages were fetched — the Brief and Final Prompt panels
 * were always blank after a page refresh. Now all four data sources are read.
 */
// Inside project.service.ts — replace the loadProjectData function

export async function loadProjectData(projectId: string): Promise<LoadedProject> {
  try {
    const [dbMsgs, agentOutputsMap, finalPromptRow] = await Promise.all([
      getProjectMessagesAction(projectId),
      getAgentOutputsAction(projectId),
      getFinalPromptAction(projectId),
    ]);

    // Messages
    const messages: ChatMessage[] = dbMsgs.map((m) => ({
      id: m.id,
      role: m.role,
      sender_type: m.sender_type,
      content: m.content,
      timestamp: new Date(m.created_at),
    }));

    let pipelineResult: PipelineResult | null = null;
    let finalMarkdown = "";

    if (agentOutputsMap) {
      pipelineResult = {
        requirements: (agentOutputsMap.requirement_analyst || {}) as any,
        strategy: (agentOutputsMap.product_strategist || {}) as any,
        architecture: (agentOutputsMap.technical_architect || {}) as any,
        finalPrompt: (agentOutputsMap.prompt_engineer || {}) as any,
        traceId: "reloaded",
        pipelineRunId: "reloaded",
        warnings: [],
        confidenceScores: {},
        isPartialRerun: false,
      };

      finalMarkdown = finalPromptRow?.prompt_markdown
        ?? formatFinalPrompt(pipelineResult.finalPrompt);
    }

    return {
      messages,
      hasMessages: messages.length > 0,
      pipelineResult,
      finalMarkdown,
      isCompleted: pipelineResult !== null,
    };
  } catch (err) {
    logger.error("Project service: loadProjectData failed", {
      error: err,
      projectId,
    });
    return {
      messages: [],
      hasMessages: false,
      pipelineResult: null,
      finalMarkdown: "",
      isCompleted: false,
    };
  }
}

// ── Project history ──────────────────────────────────────────────────────────

export async function fetchProjectHistory(): Promise<Project[]> {
  try {
    return await getProjectsAction();
  } catch (err) {
    logger.error("Project service: fetchProjectHistory failed", { error: err });
    return [];
  }
}

// ── Persist messages ─────────────────────────────────────────────────────────

export async function persistMessage(
  projectId: string,
  msg: ChatMessage
): Promise<void> {
  const row: Message = {
    id: msg.id,
    project_id: projectId,
    role: msg.role,
    sender_type: msg.sender_type,
    content: msg.content,
    created_at: new Date().toISOString(),
  };
  try {
    await saveMessagesAction(projectId, [row]);
  } catch (err) {
    logger.error("Project service: persistMessage failed", {
      error: err,
      projectId,
      msgId: msg.id,
    });
  }
}