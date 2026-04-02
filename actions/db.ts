"use server";

// =============================================================================
// Agent OS — Supabase Database Server Actions
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type {
  Project,
  Message,
  AgentName,
  FinalPrompt,
  RequirementAnalysis,
  ProductStrategy,
  FinalPromptData,
  TechnicalArchitecture,
  ProjectStatus,
} from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Agent output type union — replaces `any`
export type AgentOutputJson =
  | RequirementAnalysis
  | ProductStrategy
  | TechnicalArchitecture
  | FinalPromptData;

// ── Project actions ──────────────────────────────────────────────────────────

/**
 * Creates a new project row in Supabase.
 */
export async function createProjectAction(
  title: string,
  idea_raw: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, idea_raw, status: "draft" }])
    .select()
    .single();

  if (error) {
    logger.error("createProjectAction failed", {
      message: error.message,
      code: error.code,
    });
    return null;
  }

  return data as Project;
}

/**
 * Updates the status column on a project row.
 */
export async function updateProjectStatusAction(
  projectId: string,
  status: ProjectStatus
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) {
    logger.error("updateProjectStatusAction failed", {
      message: error.message,
      code: error.code,
      projectId,
      status,
    });
  }
}
// ── Message actions ──────────────────────────────────────────────────────────

/**
 * Saves a batch of chat messages.
 * Preserves the frontend-generated ID so React keys stay stable on reload.
 */
export async function saveMessagesAction(
  projectId: string,
  messages: Message[]
): Promise<void> {
  const insertData = messages.map((m) => ({
    id: m.id,
    project_id: projectId,
    role: m.role,
    sender_type: m.sender_type,
    content: m.content,
  }));

  const { error } = await supabase.from("messages").insert(insertData);

  if (error) {
    logger.error("saveMessagesAction failed", {
      message: error.message,
      code: error.code,
      projectId,
    });
  }
}

// ── Agent output actions ─────────────────────────────────────────────────────

/**
 * Saves structured agent output (write path).
 */
export async function saveAgentOutputAction(
  projectId: string,
  agent_name: AgentName,
  output_json: AgentOutputJson
): Promise<void> {
  const { error } = await supabase
    .from("agent_outputs")
    .insert([{ project_id: projectId, agent_name, output_json }]);

  if (error) {
    logger.error(`saveAgentOutputAction failed for ${agent_name}`, {
      message: error.message,
      code: error.code,
      projectId,
    });
  }
}

/**
 * FIX: Reads the most recent agent outputs for a project back into the UI.
 * Previously this table was write-only — the Brief panel was always empty
 * after a page refresh. Now project reload can fully hydrate the pipeline result.
 */
export async function getAgentOutputsAction(
  projectId: string
): Promise<Record<AgentName, AgentOutputJson> | null> {
  const { data, error } = await supabase
    .from("agent_outputs")
    .select("agent_name, output_json")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("getAgentOutputsAction failed", {
      message: error.message,
      code: error.code,
      projectId,
    });
    return null;
  }

  if (!data || data.length === 0) return null;

  // Collapse to one output per agent — latest row wins
  const map: Partial<Record<AgentName, AgentOutputJson>> = {};
  for (const row of data) {
    const name = row.agent_name as AgentName;
    if (!map[name]) {
      map[name] = row.output_json as AgentOutputJson;
    }
  }

  // Only return if all four pipeline agents have outputs
  const required: AgentName[] = [
    "requirement_analyst",
    "product_strategist",
    "technical_architect",
    "prompt_engineer",
  ];
  const hasAll = required.every((k) => map[k] !== undefined);
  if (!hasAll) return null;

  return map as Record<AgentName, AgentOutputJson>;
}

// ── Final prompt actions ─────────────────────────────────────────────────────

/**
 * Saves the final markdown prompt string.
 */
export async function saveFinalPromptAction(
  projectId: string,
  prompt_markdown: string
): Promise<FinalPrompt | null> {
  const { data, error } = await supabase
    .from("final_prompts")
    .insert([{ project_id: projectId, prompt_markdown, version: 1 }])
    .select()
    .single();

  if (error) {
    logger.error("saveFinalPromptAction failed", {
      message: error.message,
      code: error.code,
      projectId,
    });
    return null;
  }

  return data as FinalPrompt;
}

/**
 * FIX: Reads the most recent final prompt for a project.
 * Previously write-only — the Final Prompt tab was always blank on reload.
 */
export async function getFinalPromptAction(
  projectId: string
): Promise<FinalPrompt | null> {
  const { data, error } = await supabase
    .from("final_prompts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows — not a real error when project has no prompt yet
    if (error.code !== "PGRST116") {
      logger.error("getFinalPromptAction failed", {
        message: error.message,
        code: error.code,
        projectId,
      });
    }
    return null;
  }

  return data as FinalPrompt;
}

// ── Project history actions ──────────────────────────────────────────────────

/**
 * Fetches all projects ordered by most recent.
 */
export async function getProjectsAction(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("getProjectsAction failed", {
      message: error.message,
      code: error.code,
    });
    return [];
  }

  return data as Project[];
}

/**
 * Fetches all messages for a project, ordered chronologically.
 */
export async function getProjectMessagesAction(
  projectId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("getProjectMessagesAction failed", {
      message: error.message,
      code: error.code,
      projectId,
    });
    return [];
  }

  return data as Message[];
}

// ── Agent message actions (Phase 1) ─────────────────────────────────────────
// These are used by the multi-agent pipeline to persist inter-agent messages.
// The agent_messages table is created in supabase/migration-v2.sql.

export interface AgentMessageInsert {
  project_id: string;
  pipeline_run_id: string;
  from_agent: AgentName | "user";
  to_agent: AgentName;
  message_type: "input" | "output" | "feedback" | "correction";
  payload: Record<string, unknown>;
  sequence_number: number;
  meta?: {
    model_used: string;
    duration_ms: number;
    confidence: number;
    used_fallback: boolean;
  };
}

/**
 * Saves a single inter-agent message to the audit log.
 */
export async function saveAgentMessageAction(
  msg: AgentMessageInsert
): Promise<void> {
  const { error } = await supabase.from("agent_messages").insert([msg]);

  if (error) {
    logger.error("saveAgentMessageAction failed", {
      message: error.message,
      code: error.code,
      pipelineRunId: msg.pipeline_run_id,
      fromAgent: msg.from_agent,
      toAgent: msg.to_agent,
    });
  }
}

/**
 * Fetches all agent messages for a specific pipeline run.
 * Useful for debugging and the Feedback Integrator (Phase 3).
 */
export async function getAgentMessagesAction(
  projectId: string,
  pipelineRunId?: string
): Promise<AgentMessageInsert[]> {
  let query = supabase
    .from("agent_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("sequence_number", { ascending: true });

  if (pipelineRunId) {
    query = query.eq("pipeline_run_id", pipelineRunId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("getAgentMessagesAction failed", {
      message: error.message,
      code: error.code,
      projectId,
    });
    return [];
  }

  return (data ?? []) as AgentMessageInsert[];
}
