// ===========================================
// Agent OS — Main Workspace Page
// ===========================================
// Preservation of the existing workspace logic.

"use client";

import { Suspense, useCallback } from "react";
import { useProject } from "@/features/workspace/hooks/useProject";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { Header } from "@/features/workspace/components/Header";
import { Sidebar } from "@/features/workspace/components/Sidebar";
import { IdeaInput } from "@/features/workspace/components/IdeaInput";
import { ChatPanel } from "@/features/workspace/components/ChatPanel";
import { BriefPanel } from "@/features/workspace/components/BriefPanel";

function WorkspaceInner() {
  const {
    projectId,
    setProjectId,
    pastProjects,
    isLoadingHistory,
    loadProjectHistoricalData,
  } = useProject();

  const ws = useWorkspace(projectId, setProjectId);
  const { state } = ws;

  const handleSelectProject = useCallback(
    (id: string, idea: string) => {
      loadProjectHistoricalData(id, idea, ws.loadProjectContext);
    },
    [loadProjectHistoricalData, ws.loadProjectContext]
  );

  const isActivePhase =
    state.phase === "chatting" ||
    state.phase === "processing" ||
    state.phase === "done" ||
    state.phase === "error";

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-blue-600/30 selection:text-blue-500">
      <Header phase={state.phase} onNewProject={ws.handleNewProject} />

      <div className="flex-1 flex overflow-hidden">
        {state.phase === "idea" && (
          <IdeaInput
            rawIdea={state.rawIdea}
            onIdeaChange={(val) => ws.dispatch({ type: "SET_RAW_IDEA", payload: val })}
            onSubmit={ws.handleStartProject}
            onKeyDown={ws.handleKeyDown}
            pastProjects={pastProjects}
            isLoadingHistory={isLoadingHistory}
            onSelectProject={handleSelectProject}
          />
        )}

        {isActivePhase && (
          <>
            <Sidebar
              phase={state.phase}
              projectId={state.projectId}
              pastProjects={pastProjects}
              agentStatuses={state.agentStatuses}
              messageCount={state.messages.length}
              onNewProject={ws.handleNewProject}
              onSelectProject={handleSelectProject}
              onGenerateNow={ws.handleGenerateNow}
              onRetryPipeline={ws.handleRetryPipeline}
            />
            <ChatPanel
              messages={state.messages}
              isAiTyping={state.loading.chat}
              phase={state.phase}
              inputValue={state.inputValue}
              onInputChange={(val) => ws.dispatch({ type: "SET_INPUT_VALUE", payload: val })}
              onKeyDown={ws.handleKeyDown}
              onSend={ws.handleSendChat}
              onRetry={ws.handleRetryPipeline}
            />
            <BriefPanel
              phase={state.phase}
              pipelineResult={state.pipelineResult}
              finalMarkdown={state.finalMarkdown}
              activeTab={state.activeTab}
              copied={state.copied}
              onTabChange={(tab) => ws.dispatch({ type: "SET_ACTIVE_TAB", payload: tab })}
              onCopy={ws.handleCopy}
              onExport={ws.handleExport}
              onRegenerate={ws.handleRegenerate}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-blue-500">Initializing Workspace...</div>}>
      <WorkspaceInner />
    </Suspense>
  );
}
