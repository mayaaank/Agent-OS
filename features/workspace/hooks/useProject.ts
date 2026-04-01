'TYPESCRIPT'
// =============================================================================
// Agent OS — useProject Hook
// =============================================================================
// Manages project history and loading. Connects to project.service.ts.

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Project, ChatMessage } from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import {
  fetchProjectHistory,
  loadProjectData,
} from "@/features/project/services/project.service";

export interface LoadedProjectContext {
  id: string;
  initialIdea: string;
  hasMessages: boolean;
  messages: ChatMessage[];
  pipelineResult: PipelineResult | null;
  finalMarkdown: string;
  isCompleted: boolean;
}

export interface UseProjectReturn {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  pastProjects: Project[];
  setPastProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isLoadingHistory: boolean;
  loadProjectHistoricalData: (
    id: string,
    initialIdea: string,
    onContextLoaded: (ctx: LoadedProjectContext) => void
  ) => Promise<void>;
}

export function useProject(): UseProjectReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("id");

  const [projectId, setProjectId] = useState<string | null>(null);
  const [pastProjects, setPastProjects] = useState<Project[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoadingHistory(true);
      const projects = await fetchProjectHistory();
      setPastProjects(projects);

      const targetId =
        queryProjectId ?? localStorage.getItem("agent_os_current_project");

      if (targetId) {
        const found = projects.find((p) => p.id === targetId);
        if (found) setProjectId(found.id);
      }

      setIsLoadingHistory(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryProjectId]);

  /**
   * FIX: Now fetches messages AND agent outputs AND final prompt.
   * The full LoadedProjectContext is passed to onContextLoaded so
   * useWorkspace can dispatch a single LOAD_PROJECT action that
   * restores all three panels (chat, brief, prompt) at once.
   */
  const loadProjectHistoricalData = async (
    id: string,
    initialIdea: string,
    onContextLoaded: (ctx: LoadedProjectContext) => void
  ) => {
    setProjectId(id);
    localStorage.setItem("agent_os_current_project", id);
    router.replace(`/workspace?id=${id}`, { scroll: false });

    const data = await loadProjectData(id);

    onContextLoaded({
      id,
      initialIdea,
      hasMessages: data.hasMessages,
      messages: data.messages,
      pipelineResult: data.pipelineResult,
      finalMarkdown: data.finalMarkdown,
      isCompleted: data.isCompleted,
    });
  };

  return {
    projectId,
    setProjectId,
    pastProjects,
    setPastProjects,
    isLoadingHistory,
    loadProjectHistoricalData,
  };
}