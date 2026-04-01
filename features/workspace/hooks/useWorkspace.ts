// ===========================================
// Agent OS — useWorkspace Hook (Controller)
// ===========================================
// This hook operates purely as a controller.
// It manages UI state via a pure useReducer and delegates ALL
// API/business orchestration to domain services.

"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, Project } from "@/types";
import { workspaceReducer, initialWorkspaceState } from "./workspaceReducer";
import { sendChatMessage, validateChatInput } from "@/features/chat/services/chat.service";
import {
  runPipelineRequest,
  shouldTriggerPipeline,
} from "@/features/pipeline/services/pipeline.service";
import { createProject, persistMessage } from "@/features/project/services/project.service";

export function useWorkspace(
  projectId: string | null,
  setProjectId: (id: string | null) => void // Kept for inter-hook compatibility, though ideally all in context
) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(workspaceReducer, {
    ...initialWorkspaceState,
    projectId,
  });

  // ── Helpers ──────────────────────────────────────────────

  const updateAgentStatus = useCallback(
    (index: number, status: "pending" | "running" | "done") => {
      dispatch({ type: "UPDATE_AGENT_STATUS", payload: { index, status } });
    },
    []
  );

  const resetPipeline = useCallback(() => {
    dispatch({ type: "RESET_PIPELINE" });
  }, []);

  const dispatchError = useCallback(
    (message: string, isPipeline: boolean = false) => {
      if (isPipeline) {
        dispatch({ type: "SET_PHASE", payload: "error" });
      }
      dispatch({ type: "SET_ERROR", payload: message });
      toast({ variant: "destructive", title: isPipeline ? "Pipeline failed" : "Error", description: message });
    },
    [toast]
  );

  // ── Pipeline Orchestration ───────────────────────────────

  const runPipeline = useCallback(
    async (chatMessages: ChatMessage[], activeProjectId?: string | null) => {
      dispatch({ type: "SET_PHASE", payload: "processing" });
      dispatch({ type: "SET_LOADING", payload: { pipeline: true } });

      try {
        const pid = activeProjectId ?? state.projectId;
        const { result, markdown } = await runPipelineRequest(chatMessages, updateAgentStatus, pid);

        dispatch({
          type: "SET_PIPELINE_RESULT",
          payload: { result, markdown },
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        dispatchError(message, true);
      } finally {
        dispatch({ type: "SET_LOADING", payload: { pipeline: false } });
      }
    },
    [state.projectId, dispatchError, updateAgentStatus]
  );

  // ── Chat Orchestration ───────────────────────────────────

  const sendMessage = useCallback(
    async (
      content: string,
      existingMessages?: ChatMessage[],
      currentProjectId?: string | null
    ) => {
      const activeProjectId = currentProjectId ?? state.projectId;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        sender_type: "user",
        content,
        timestamp: new Date(),
      };

      const allMsgs = [...(existingMessages ?? state.messages), userMsg];

      dispatch({ type: "SET_MESSAGES", payload: allMsgs });
      dispatch({ type: "SET_INPUT_VALUE", payload: "" });
      dispatch({ type: "SET_LOADING", payload: { chat: true } });

      if (activeProjectId) {
        await persistMessage(activeProjectId, userMsg);
      }

      try {
        const { content: aiContent } = await sendChatMessage(allMsgs);

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          sender_type: "orchestrator",
          content: aiContent,
          timestamp: new Date(),
        };

        const updatedMsgs = [...allMsgs, aiMsg];
        dispatch({ type: "SET_MESSAGES", payload: updatedMsgs });

        if (activeProjectId) {
          await persistMessage(activeProjectId, aiMsg);
        }

        if (shouldTriggerPipeline(aiContent)) {
          setTimeout(() => runPipeline(updatedMsgs, activeProjectId), 1500);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach the AI.";
        dispatchError(message);

        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: crypto.randomUUID(),
            role: "assistant",
            sender_type: "orchestrator",
            content: "Something went wrong. Please try sending your message again.",
            timestamp: new Date(),
          },
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: { chat: false } });
      }
    },
    [state.messages, state.projectId, runPipeline, dispatchError]
  );

  // ── Action Handlers ──────────────────────────────────────

  const handleStartProject = useCallback(async () => {
    const { valid, error } = validateChatInput(state.rawIdea);
    if (!valid) {
      toast({ variant: "destructive", title: "Invalid Input", description: error });
      return;
    }

    const result = await createProject(state.rawIdea);
    if (!result) {
       dispatchError("Could not create project.");
       return;
    }

    const { project, newId } = result;
    setProjectId(newId);
    dispatch({
       type: "INIT_PROJECT",
       payload: { projectId: newId, rawIdea: state.rawIdea, hasMessages: true, messages: [] }
    });

    router.replace(`/workspace?id=${newId}`, { scroll: false });
    sendMessage(state.rawIdea, [], newId);

    return project;
  }, [state.rawIdea, sendMessage, setProjectId, router, dispatchError, toast]);

  const handleSendChat = useCallback(() => {
    const { valid } = validateChatInput(state.inputValue);
    if (!valid || state.loading.chat) return;
    sendMessage(state.inputValue);
  }, [state.inputValue, state.loading.chat, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (state.phase === "idea") handleStartProject();
        else handleSendChat();
      }
    },
    [state.phase, handleStartProject, handleSendChat]
  );

  const handleGenerateNow = useCallback(() => {
    if (state.messages.length < 2) return;
    runPipeline(state.messages);
  }, [state.messages, runPipeline]);

  const handleRegenerate = useCallback(() => {
    resetPipeline();
    runPipeline(state.messages);
  }, [state.messages, resetPipeline, runPipeline]);

  const handleRetryPipeline = useCallback(() => {
    dispatch({ type: "SET_PHASE", payload: "processing" });
    runPipeline(state.messages);
  }, [state.messages, runPipeline]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(state.finalMarkdown);
    dispatch({ type: "SET_COPIED", payload: true });
    toast({ title: "Copied!", description: "Prompt copied to clipboard." });
    setTimeout(() => dispatch({ type: "SET_COPIED", payload: false }), 2000);
  }, [state.finalMarkdown, toast]);

  const handleExport = useCallback(() => {
    const blob = new Blob([state.finalMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      state.pipelineResult?.finalPrompt.product_name
        ?.replace(/\s+/g, "-")
        .toLowerCase() ?? "project"
    }-prompt.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.finalMarkdown, state.pipelineResult]);

  const handleNewProject = useCallback(() => {
    if (typeof window !== "undefined") {
       localStorage.removeItem("agent_os_current_project");
    }
    router.replace("/workspace", { scroll: false }); // Reset within workspace context
    setProjectId(null);
    dispatch({ type: "RESET_PROJECT" });
  }, [router, setProjectId]);

  const loadProjectContext = useCallback((
      id: string,
      initialIdea: string,
      hasMessages: boolean,
      messages: ChatMessage[]
  ) => {
      setProjectId(id);
      dispatch({
        type: "INIT_PROJECT",
        payload: { projectId: id, rawIdea: initialIdea, hasMessages, messages }
       });
  }, [setProjectId]);
  
  return {
    state,
    dispatch,
    handleStartProject,
    handleSendChat,
    handleKeyDown,
    handleGenerateNow,
    handleRegenerate,
    handleRetryPipeline,
    handleCopy,
    handleExport,
    handleNewProject,
    loadProjectContext,
    resetPipeline,
  };
}
