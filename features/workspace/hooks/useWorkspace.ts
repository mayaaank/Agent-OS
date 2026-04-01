'EOF'
// =============================================================================
// Agent OS — useWorkspace Hook (Controller)
// =============================================================================
// PHASE 3: handleFeedbackSubmit added for partial pipeline re-run via feedback.

"use client";

import { useReducer, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types";
import { workspaceReducer, initialWorkspaceState } from "./workspaceReducer";
import type { LoadedProjectContext } from "./useProject";
import {
  sendChatMessage,
  validateChatInput,
} from "@/features/chat/services/chat.service";
import {
  runPipelineRequest,
  shouldTriggerPipeline,
} from "@/features/pipeline/services/pipeline.service";
import {
  createProject,
  persistMessage,
  updateProjectStatus,
} from "@/features/project/services/project.service";

export function useWorkspace(
  projectId: string | null,
  setProjectId: (id: string | null) => void
) {
  const router = useRouter();
  const { toast } = useToast();
  const isSubmitting = useRef(false);

  const [state, dispatch] = useReducer(workspaceReducer, {
    ...initialWorkspaceState,
    projectId,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateAgentStatus = useCallback(
    (index: number, status: "pending" | "running" | "done") => {
      dispatch({ type: "UPDATE_AGENT_STATUS", payload: { index, status } });
    },
    []
  );

  const dispatchError = useCallback(
    (message: string, isPipeline = false) => {
      if (isPipeline) dispatch({ type: "SET_PHASE", payload: "error" });
      dispatch({ type: "SET_ERROR", payload: message });
      toast({
        variant: "destructive",
        title: isPipeline ? "Pipeline failed" : "Error",
        description: message,
      });
    },
    [toast]
  );

  // ── Pipeline orchestration ─────────────────────────────────────────────────

  const runPipeline = useCallback(
    async (
      chatMessages: ChatMessage[],
      activeProjectId?: string | null,
      options: { feedback?: string; restartFrom?: import("@/types").AgentName } = {}
    ) => {
      dispatch({ type: "SET_PHASE", payload: "processing" });
      dispatch({ type: "SET_LOADING", payload: { pipeline: true } });

      const pid = activeProjectId ?? state.projectId;

      if (pid) {
        await updateProjectStatus(pid, "processing");
      }

      try {
        const { result, markdown } = await runPipelineRequest(
          chatMessages,
          updateAgentStatus,
          pid,
          {
            rawIdea: state.rawIdea,
            feedback: options.feedback,
            restartFrom: options.restartFrom,
          }
        );

        dispatch({ type: "SET_PIPELINE_RESULT", payload: { result, markdown } });

        if (pid) {
          await updateProjectStatus(pid, "completed");
        }

        if (options.feedback) {
          toast({
            title: "Brief updated",
            description: options.restartFrom
              ? `Re-ran from ${options.restartFrom.replace(/_/g, " ")}`
              : "Pipeline re-run from feedback",
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        dispatchError(message, true);
        if (pid) {
          await updateProjectStatus(pid, "error");
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: { pipeline: false } });
      }
    },
    [state.projectId, state.rawIdea, dispatchError, updateAgentStatus, toast]
  );

  // ── Chat orchestration ─────────────────────────────────────────────────────

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
        const message =
          err instanceof Error ? err.message : "Failed to reach the AI.";
        dispatchError(message);
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: crypto.randomUUID(),
            role: "assistant",
            sender_type: "orchestrator",
            content: "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: { chat: false } });
        isSubmitting.current = false;
      }
    },
    [state.messages, state.projectId, runPipeline, dispatchError]
  );

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleStartProject = useCallback(async () => {
    if (isSubmitting.current) return;
    const { valid, error } = validateChatInput(state.rawIdea);
    if (!valid) {
      toast({ variant: "destructive", title: "Invalid Input", description: error });
      return;
    }
    isSubmitting.current = true;
    const result = await createProject(state.rawIdea);
    if (!result) {
      isSubmitting.current = false;
      dispatchError("Could not create project.");
      return;
    }
    const { project, newId } = result;
    setProjectId(newId);
    dispatch({
      type: "INIT_PROJECT",
      payload: { projectId: newId, rawIdea: state.rawIdea, hasMessages: true, messages: [] },
    });
    router.replace(`/?id=${newId}`, { scroll: false });
    await updateProjectStatus(newId, "gathering");
    sendMessage(state.rawIdea, [], newId);
    return project;
  }, [state.rawIdea, sendMessage, setProjectId, router, dispatchError, toast]);

  const handleSendChat = useCallback(() => {
    if (isSubmitting.current) return;
    const { valid } = validateChatInput(state.inputValue);
    if (!valid || state.loading.chat) return;
    isSubmitting.current = true;
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
    dispatch({ type: "RESET_PIPELINE" });
    runPipeline(state.messages);
  }, [state.messages, runPipeline]);

  const handleRetryPipeline = useCallback(() => {
    dispatch({ type: "SET_PHASE", payload: "processing" });
    runPipeline(state.messages);
  }, [state.messages, runPipeline]);

  // PHASE 3: Submit user feedback for partial pipeline re-run
  const handleFeedbackSubmit = useCallback(() => {
    const feedback = state.feedbackValue.trim();
    if (!feedback || state.loading.pipeline) return;
    dispatch({ type: "SET_FEEDBACK_VALUE", payload: "" });
    runPipeline(state.messages, state.projectId, { feedback });
  }, [state.feedbackValue, state.messages, state.projectId, state.loading.pipeline, runPipeline]);

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
    a.download = `${state.pipelineResult?.finalPrompt.product_name
        ?.replace(/\s+/g, "-").toLowerCase() ?? "project"
      }-prompt.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.finalMarkdown, state.pipelineResult]);

  const handleNewProject = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("agent_os_current_project");
    }
    router.replace("/", { scroll: false });
    setProjectId(null);
    dispatch({ type: "RESET_PROJECT" });
  }, [router, setProjectId]);

  const loadProjectContext = useCallback(
    (ctx: LoadedProjectContext) => {
      setProjectId(ctx.id);
      dispatch({
        type: "LOAD_PROJECT",
        payload: {
          projectId: ctx.id,
          rawIdea: ctx.initialIdea,
          hasMessages: ctx.hasMessages,
          messages: ctx.messages,
          pipelineResult: ctx.pipelineResult,
          finalMarkdown: ctx.finalMarkdown,
          isCompleted: ctx.isCompleted,
        },
      });
    },
    [setProjectId]
  );

  return {
    state,
    dispatch,
    handleStartProject,
    handleSendChat,
    handleKeyDown,
    handleGenerateNow,
    handleRegenerate,
    handleRetryPipeline,
    handleFeedbackSubmit,  // PHASE 3
    handleCopy,
    handleExport,
    handleNewProject,
    loadProjectContext,
  };
}