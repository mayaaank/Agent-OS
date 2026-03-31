// ===========================================
// Agent OS — Project Service
// ===========================================
// Wraps project-related server actions.
// Handles localStorage + router side-effects
// so hooks and components stay clean.

import {
  createProjectAction,
  getProjectsAction,
  getProjectMessagesAction,
  saveMessagesAction,
} from "@/actions/db";
import type { ChatMessage, Project, Message } from "@/types";
import { logger } from "@/lib/logger";

// ---- Project creation -------------------------------------------------------

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

// ---- Project loading --------------------------------------------------------

export interface LoadedProject {
  messages: ChatMessage[];
  hasMessages: boolean;
}

export async function loadProjectMessages(
  projectId: string
): Promise<LoadedProject> {
  try {
    const dbMsgs = await getProjectMessagesAction(projectId);
    if (dbMsgs.length === 0) return { messages: [], hasMessages: false };

    const messages: ChatMessage[] = dbMsgs.map((m) => ({
      id: m.id,
      role: m.role,
      sender_type: m.sender_type,
      content: m.content,
      timestamp: new Date(m.created_at),
    }));

    return { messages, hasMessages: true };
  } catch (err) {
    logger.error("Project service: loadProjectMessages failed", { error: err, projectId });
    return { messages: [], hasMessages: false };
  }
}

// ---- Project history --------------------------------------------------------

export async function fetchProjectHistory(): Promise<Project[]> {
  try {
    return await getProjectsAction();
  } catch (err) {
     logger.error("Project service: fetchProjectHistory failed", { error: err });
     return [];
  }
}

// ---- Persist messages -------------------------------------------------------

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
    logger.error("Project service: persistMessage failed", { error: err, projectId, msgId: msg.id });
  }
}
