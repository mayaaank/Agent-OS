"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BrainCircuit, Send, Loader2, Copy, Download, RotateCcw,
  Sparkles, FileText, CheckCircle2, Bot, User, Plus, Folder
} from "lucide-react";
import type {
  ChatMessage, Project
} from "@/types";
import type { PipelineResult } from "@/agents/orchestrator";
import { formatFinalPrompt } from "@/utils/format-prompt";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createProjectAction,
  saveMessagesAction,
  saveFinalPromptAction,
  saveAgentOutputAction,
  getProjectsAction,
  getProjectMessagesAction
} from "@/actions/db";

type WorkspacePhase = "idea" | "chatting" | "processing" | "done";

interface AgentStatus {
  name: string;
  status: "pending" | "running" | "done";
}

export default function WorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("id");

  // ---- Core State ----
  const [projectId, setProjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<WorkspacePhase>("idea");
  const [rawIdea, setRawIdea] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [finalMarkdown, setFinalMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  // ---- History State ----
  const [pastProjects, setPastProjects] = useState<Project[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { name: "Requirement Analyst", status: "pending" },
    { name: "Product Strategist", status: "pending" },
    { name: "Technical Architect", status: "pending" },
    { name: "Prompt Engineer", status: "pending" },
  ]);
  const [activeTab, setActiveTab] = useState<"brief" | "prompt">("brief");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---- Load History on Mount ----
  useEffect(() => {
    async function loadHistory() {
      setIsLoadingHistory(true);
      const projects = await getProjectsAction();
      setPastProjects(projects);

      const targetId = queryProjectId || localStorage.getItem("agent_os_current_project");
      if (targetId) {
        const found = projects.find(p => p.id === targetId);
        if (found) {
          await loadProjectContext(found.id, found.idea_raw);
        }
      }
      setIsLoadingHistory(false);
    }
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryProjectId]);

  // ---- Scroll to bottom on new messages ----
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const loadProjectContext = async (id: string, initialIdea: string) => {
    setProjectId(id);
    localStorage.setItem("agent_os_current_project", id);
    router.replace(`/workspace?id=${id}`, { scroll: false });

    const dbMsgs = await getProjectMessagesAction(id);
    if (dbMsgs.length > 0) {
      const mappedMsgs: ChatMessage[] = dbMsgs.map(m => ({
        id: m.id,
        role: m.role,
        sender_type: m.sender_type,
        content: m.content,
        timestamp: new Date(m.created_at)
      }));
      setMessages(mappedMsgs);
      setPhase("chatting");
    } else {
      setMessages([]);
      setRawIdea(initialIdea);
      setPhase("idea");
    }
    // Reset pipeline state
    setPipelineResult(null);
    setFinalMarkdown("");
    setAgentStatuses(prev => prev.map(a => ({ ...a, status: "pending" })));
  };

  // ---- Run the multi-agent pipeline ----
  const runPipeline = useCallback(async (
    chatMessages: ChatMessage[],
    activeProjectId?: string
  ) => {
    setPhase("processing");

    const updateStatus = (index: number, status: AgentStatus["status"]) => {
      setAgentStatuses(prev =>
        prev.map((a, i) => (i === index ? { ...a, status } : a))
      );
    };

    try {
      for (let i = 0; i < 4; i++) {
        updateStatus(i, "running");
        await new Promise(r => setTimeout(r, 800));
      }

      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!res.ok) throw new Error("Pipeline API failed");

      const result: PipelineResult = await res.json();
      setPipelineResult(result);

      setAgentStatuses(prev => prev.map(a => ({ ...a, status: "done" })));

      const md = formatFinalPrompt(result.finalPrompt);
      setFinalMarkdown(md);

      if (activeProjectId) {
        saveAgentOutputAction(activeProjectId, "requirement_analyst", result.requirements);
        saveAgentOutputAction(activeProjectId, "product_strategist", result.strategy);
        saveAgentOutputAction(activeProjectId, "technical_architect", result.architecture);
        saveFinalPromptAction(activeProjectId, md);
      }

      setPhase("done");
    } catch (err) {
      console.error("Pipeline error:", err);
      setPhase("chatting");
      setAgentStatuses(prev => prev.map(a => ({ ...a, status: "pending" })));
    }
  }, []);

  // ---- Send message to orchestrator ----
  const sendMessage = useCallback(
    async (content: string, existingMessages?: ChatMessage[], currentProjectId?: string) => {
      const activeProjectId = currentProjectId ?? projectId ?? undefined;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        sender_type: "user",
        content,
        timestamp: new Date(),
      };

      const allMsgs = [...(existingMessages ?? messages), userMsg];
      setMessages(allMsgs);
      setInputValue("");
      setIsAiTyping(true);

      if (activeProjectId) {
        await saveMessagesAction(activeProjectId, [{
          id: userMsg.id,
          project_id: activeProjectId,
          role: "user",
          sender_type: "user",
          content: userMsg.content,
          created_at: new Date().toISOString()
        }]);
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMsgs }),
        });

        if (!res.ok) throw new Error("Chat API failed");

        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          sender_type: "orchestrator",
          content: data.content,
          timestamp: new Date(),
        };

        const updatedMsgs = [...allMsgs, aiMsg];
        setMessages(updatedMsgs);

        if (activeProjectId) {
          await saveMessagesAction(activeProjectId, [{
            id: aiMsg.id,
            project_id: activeProjectId,
            role: "assistant",
            sender_type: "orchestrator",
            content: aiMsg.content,
            created_at: new Date().toISOString()
          }]);
        }

        if (
          data.content.toLowerCase().includes("enough information") ||
          data.content.toLowerCase().includes("generate your")
        ) {
          setTimeout(() => runPipeline(updatedMsgs, activeProjectId), 1500);
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          sender_type: "orchestrator",
          content: "Sorry, I encountered an error communicating with Mistral AI. Please try again.",
          timestamp: new Date(),
        }]);
      } finally {
        setIsAiTyping(false);
      }
    },
    [messages, projectId, runPipeline]
  );

  // ---- Start from raw idea ----
  const handleStartProject = async () => {
    if (!rawIdea.trim()) return;

    const title = rawIdea.slice(0, 40) + (rawIdea.length > 40 ? "..." : "");
    const newProject = await createProjectAction(title, rawIdea);

    const newId = newProject?.id ?? null;

    if (newId) {
      setPastProjects(prev => [newProject!, ...prev]);
      localStorage.setItem("agent_os_current_project", newId);
      router.replace(`/workspace?id=${newId}`, { scroll: false });
    }

    setProjectId(newId);
    setPhase("chatting");
    sendMessage(rawIdea, [], newId ?? undefined);
  };

  // ---- Send follow-up chat message ----
  const handleSendChat = () => {
    if (!inputValue.trim() || isAiTyping) return;
    sendMessage(inputValue);
  };

  // ---- Keyboard submit ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (phase === "idea") handleStartProject();
      else handleSendChat();
    }
  };

  // ---- Manual trigger for pipeline ----
  const handleGenerateNow = () => {
    if (messages.length < 2) return;
    runPipeline(messages, projectId ?? undefined);
  };

  // ---- Regenerate prompt ----
  const handleRegenerate = () => {
    setAgentStatuses(prev => prev.map(a => ({ ...a, status: "pending" })));
    setPipelineResult(null);
    setFinalMarkdown("");
    runPipeline(messages, projectId ?? undefined);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([finalMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pipelineResult?.finalPrompt.product_name?.replace(/\s+/g, "-").toLowerCase() ?? "project"}-prompt.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewProject = () => {
    localStorage.removeItem("agent_os_current_project");
    router.replace(`/workspace`, { scroll: false });
    setProjectId(null);
    setPhase("idea");
    setRawIdea("");
    setMessages([]);
    setInputValue("");
    setPipelineResult(null);
    setFinalMarkdown("");
    setAgentStatuses(prev => prev.map(a => ({ ...a, status: "pending" })));
    setActiveTab("brief");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between h-13 px-4 border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center">
              <BrainCircuit className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Agent OS</span>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">
            {phase === "idea" && "New Project"}
            {phase === "chatting" && "Gathering Requirements"}
            {phase === "processing" && "Agents Processing..."}
            {phase === "done" && "Prompt Ready"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {phase !== "idea" && (
            <Button variant="ghost" size="sm" onClick={handleNewProject}>
              <Plus className="size-3.5 mr-1.5" />
              New
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== IDEA PHASE ===== */}
        {phase === "idea" && (
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Simple history sidebar exclusively when creating a new idea */}
            <aside className="hidden lg:flex w-64 border-r border-border/50 flex-col bg-sidebar/30">
              <div className="p-4 border-b border-border/50">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Projects</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {isLoadingHistory ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : pastProjects.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No projects yet.
                  </div>
                ) : (
                  pastProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => loadProjectContext(p.id, p.idea_raw)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted text-foreground/80 hover:text-foreground line-clamp-2"
                    >
                      <span className="flex items-center gap-2">
                        <Folder className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{p.title}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <div className="flex-1 flex items-center justify-center p-8 bg-background/50">
              <div className="max-w-2xl w-full space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-2">
                    <Sparkles className="size-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">What do you want to build?</h1>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Describe your idea in plain language. Our AI agents will help you
                    refine it into a structured, build-ready prompt.
                  </p>
                </div>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., I want to build a habit tracking app where users can set daily goals..."
                    className="min-h-[140px] resize-none text-base p-4 pr-14 rounded-xl border-border/80 focus:border-primary/50 bg-card"
                    autoFocus
                  />
                  <Button
                    onClick={handleStartProject}
                    disabled={!rawIdea.trim()}
                    size="icon"
                    className="absolute right-3 bottom-3 size-9 rounded-lg"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Press Enter to start • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== CHAT + SIDE PANELS ===== */}
        {(phase === "chatting" || phase === "processing" || phase === "done") && (
          <>
            {/* Left sidebar */}
            <aside className="w-56 border-r border-border/50 p-3 hidden lg:flex flex-col gap-3 bg-sidebar/50">
              <Button variant="outline" size="sm" className="justify-start text-xs" onClick={handleNewProject}>
                <Plus className="size-3 mr-1.5" />
                New Project
              </Button>

              <div className="pt-2">
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-2">My Projects</h3>
                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                  {pastProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => loadProjectContext(p.id, p.idea_raw)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors truncate ${projectId === p.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-2">
                  Agent Status
                </p>
                {agentStatuses.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs">
                    {agent.status === "pending" && <div className="size-2 rounded-full bg-muted-foreground/30" />}
                    {agent.status === "running" && <Loader2 className="size-3 text-primary animate-spin" />}
                    {agent.status === "done" && <CheckCircle2 className="size-3 text-green-500" />}
                    <span className={agent.status === "done" ? "text-foreground" : "text-muted-foreground"}>
                      {agent.name}
                    </span>
                  </div>
                ))}
              </div>

              {phase === "chatting" && messages.length >= 4 && (
                <>
                  <Separator />
                  <Button size="sm" variant="secondary" className="text-xs" onClick={handleGenerateNow}>
                    <Sparkles className="size-3 mr-1.5" />
                    Generate Now
                  </Button>
                </>
              )}
            </aside>

            {/* Center - Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="size-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border/60"
                        }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="size-7 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <User className="size-3.5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isAiTyping && (
                  <div className="flex gap-3 animate-fade-in-up">
                    <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl px-4 py-3">
                      <div className="flex gap-1.5 text-primary">
                        <div className="size-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                        <div className="size-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                        <div className="size-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing overlay */}
                {phase === "processing" && (
                  <div className="flex items-center justify-center py-8 animate-fade-in-up">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border/60 pulse-glow">
                      <Loader2 className="size-6 text-primary animate-spin" />
                      <p className="text-sm font-medium">Agents are analyzing your requirements...</p>
                      <p className="text-xs text-muted-foreground">This may take 10-20 seconds</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              {phase === "chatting" && (
                <div className="p-4 border-t border-border/50 bg-card/30">
                  <div className="relative max-w-3xl mx-auto">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response..."
                      className="min-h-[52px] max-h-[120px] resize-none pr-12 rounded-xl border-border/80 bg-card text-sm"
                      disabled={isAiTyping}
                    />
                    <Button
                      onClick={handleSendChat}
                      disabled={!inputValue.trim() || isAiTyping}
                      size="icon"
                      className="absolute right-2 bottom-2 size-8 rounded-lg"
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - Brief & Prompt */}
            <aside className="w-[420px] border-l border-border/50 hidden xl:flex flex-col bg-card/30">
              {phase === "done" && pipelineResult ? (
                <>
                  <div className="flex items-center border-b border-border/50 px-1">
                    <button
                      onClick={() => setActiveTab("brief")}
                      className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${activeTab === "brief"
                          ? "text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Structured Brief
                    </button>
                    <button
                      onClick={() => setActiveTab("prompt")}
                      className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${activeTab === "prompt"
                          ? "text-primary border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Final Prompt
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {activeTab === "brief" ? (
                      <BriefPanel result={pipelineResult} />
                    ) : (
                      <div className="markdown-content text-sm">
                        <ReactMarkdown>{finalMarkdown}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-border/50 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleCopy}>
                      {copied
                        ? <CheckCircle2 className="size-3 mr-1.5 text-green-500" />
                        : <Copy className="size-3 mr-1.5" />}
                      {copied ? "Copied!" : "Copy Prompt"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleExport}>
                      <Download className="size-3 mr-1.5" /> Export .md
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={handleRegenerate}>
                      <RotateCcw className="size-3 mr-1.5" /> Redo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <div className="size-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      {phase === "processing" ? "Generating your brief..." : "Your structured brief will appear here"}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[240px]">
                      {phase === "processing"
                        ? "Agents are analyzing your conversation."
                        : "Keep chatting with the AI counselor. Once enough info is gathered, the agents will process everything. Or hit Generate Now."}
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function BriefPanel({ result }: { result: PipelineResult }) {
  const { requirements, strategy, architecture, finalPrompt } = result;

  return (
    <div className="space-y-5 text-sm">
      <div>
        <h2 className="text-lg font-bold">{finalPrompt.product_name}</h2>
        <p className="text-muted-foreground mt-1">{finalPrompt.concept}</p>
      </div>
      <Separator />
      <Section title="Problem Statement">
        <p className="text-muted-foreground">{requirements.problem_statement}</p>
      </Section>
      <Section title="Goals">
        <div className="flex flex-wrap gap-1.5">
          {requirements.goals.map((g) => (
            <Badge key={g} variant="secondary" className="text-xs font-normal">{g}</Badge>
          ))}
        </div>
      </Section>
      <Section title="MVP Features">
        <div className="space-y-1.5">
          {strategy.feature_priorities.map((f) => (
            <div key={f.feature} className="flex items-center gap-2">
              <Badge
                variant={f.priority === "must" ? "default" : "secondary"}
                className="text-[10px] uppercase w-12 justify-center"
              >
                {f.priority}
              </Badge>
              <span className="text-muted-foreground">{f.feature}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Suggested Stack">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(architecture.suggested_stack).map(([key, val]) => (
            <div key={key} className="rounded-lg bg-muted/50 p-2">
              <p className="text-[10px] uppercase font-medium text-muted-foreground">{key}</p>
              <p className="text-xs font-medium mt-0.5">{val as string}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}