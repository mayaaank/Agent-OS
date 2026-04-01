// ===========================================
// Agent OS — useProject Hook
// ===========================================
// Manages project history and loading. Connects to project.service.ts.

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Project, ChatMessage } from "@/types";
import {
  fetchProjectHistory,
  loadProjectMessages,
} from "@/features/project/services/project.service";

export interface UseProjectReturn {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  pastProjects: Project[];
  setPastProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  isLoadingHistory: boolean;
  loadProjectHistoricalData: (
    id: string,
    initialIdea: string,
    onContextLoaded: (id: string, initialIdea: string, hasMessages: boolean, messages: ChatMessage[]) => void
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

  const loadProjectHistoricalData = async (
    id: string,
    initialIdea: string,
    onContextLoaded: (id: string, initialIdea: string, hasMessages: boolean, messages: ChatMessage[]) => void
  ) => {
    setProjectId(id);
    localStorage.setItem("agent_os_current_project", id);
    router.replace(`/workspace?id=${id}`, { scroll: false });

    const { messages, hasMessages } = await loadProjectMessages(id);
    
    // Pass everything back to useWorkspace controller to dispatch accurately
    onContextLoaded(id, initialIdea, hasMessages, messages);
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
