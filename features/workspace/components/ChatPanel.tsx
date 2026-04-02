// ===========================================
// Agent OS — ChatPanel Component (Tech Style)
// ===========================================
import { useRef, useEffect } from "react";
import {
  User, Loader2, AlertCircle, RotateCcw, Send, MessageCircle, Bot, Cpu
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types";
import type { WorkspacePhase } from "@/types/workspace";

interface ChatPanelProps {
  messages: ChatMessage[];
  isAiTyping: boolean;
  phase: WorkspacePhase;
  inputValue: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onRetry: () => void;
}

export function ChatPanel({
  messages,
  isAiTyping,
  phase,
  inputValue,
  onInputChange,
  onKeyDown,
  onSend,
  onRetry,
}: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background relative font-sans">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-8 relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 shadow-sm">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">Initializing Processor...</h3>
            <p className="text-sm max-w-xs text-muted-foreground">Waiting for your requirement input to begin the analysis phase.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end text-right" : "items-start text-left"
              }`}
          >
            {msg.role === "assistant" && (
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.2em] ml-1">AgentOS</span>
            )}
            <div
              className={`max-w-[85%] px-6 py-4 text-[15px] leading-[1.6] transition-all relative ${msg.role === "user"
                  ? "bg-muted text-foreground rounded-[18px] rounded-tr-[4px] shadow-sm"
                  : "bg-card border-l-2 border-[#00f0ff] text-foreground/90 rounded-[4px] rounded-r-[18px] rounded-bl-[18px]"
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
          </div>
        ))}

        {isAiTyping && (
          <div className="flex flex-col gap-2 items-start">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.2em] ml-1">AgentOS</span>
            <div className="bg-card border-l-2 border-[#00f0ff] rounded-[4px] rounded-r-[18px] rounded-bl-[18px] px-6 py-4">
              <div className="flex gap-1.5">
                <div className="size-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:0ms]" />
                <div className="size-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:200ms]" />
                <div className="size-1.5 rounded-full bg-[#00f0ff] animate-pulse [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}

        {phase === "processing" && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 p-10 rounded-2xl bg-muted border border-border max-w-sm text-center shadow-lg">
              <Loader2 className="size-10 text-[#00f0ff] animate-spin opacity-50" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">Analyzing Requirements</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Multi-agent pipeline active</p>
              </div>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-destructive/10 border border-destructive/20 max-w-sm text-center shadow-lg">
              <div className="p-4 bg-destructive/5 rounded-full border border-destructive/10">
                <AlertCircle className="size-8 text-destructive/60" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground mb-2">Pipeline Collision</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The multi-agent system encountered an unexpected structural error. Your project state has been preserved.
                </p>
              </div>
              <Button onClick={onRetry} className="w-full h-11 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive font-bold tracking-widest transition-all">
                <RotateCcw className="size-4 mr-2" />
                RETRY REASONING
              </Button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {phase === "chatting" && (
        <div className="p-6 border-t border-border">
          <div className="relative max-w-4xl mx-auto h-12 border border-border rounded-full flex items-center px-6 bg-background group focus-within:border-accent/40 transition-all">
            <span className="text-muted-foreground mr-2 flex-shrink-0">&gt;</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your idea here..."
              className="flex-1 bg-transparent border-none outline-none text-foreground/90 text-[15px] placeholder:text-muted-foreground/50 disabled:opacity-50"
              disabled={isAiTyping}
            />
            <button
              onClick={onSend}
              disabled={!inputValue.trim() || isAiTyping}
              className="text-accent opacity-60 hover:opacity-100 disabled:opacity-20 transition-all p-1 ml-2 hover:scale-110 active:scale-95"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

