"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  MessageSquareText,
  Layers3,
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  Bot,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    router.push("/workspace");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <BrainCircuit className="size-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Agent OS</span>
        </div>
        <Button onClick={handleStart} size="sm" disabled={isLoading}>
          {isLoading ? "Loading..." : "Get Started"}
          {!isLoading && <ArrowRight className="size-3.5 ml-1" />}
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="size-3.5" />
            Multi-Agent AI Counselor
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Turn Your Idea Into a{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Build-Ready Prompt
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Agent OS is an AI requirement counselor. Describe your idea,
            answer a few questions, and get a polished, structured prompt
            ready to paste into Cursor or Antigravity.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isLoading}
              className="text-base px-6 h-11"
            >
              <Zap className="size-4 mr-2" />
              {isLoading ? "Loading..." : "Start Building"}
            </Button>
            <p className="text-sm text-muted-foreground">
              No signup required • Free to use
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-5xl mx-auto w-full pb-20">
          <h2 className="text-center text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: MessageSquareText,
                title: "1. Describe Your Idea",
                desc: "Tell us what you want to build in plain language. No technical jargon needed.",
              },
              {
                icon: Bot,
                title: "2. Answer Questions",
                desc: "Our AI counselor asks smart follow-up questions to clarify your vision.",
              },
              {
                icon: Layers3,
                title: "3. Agents Analyze",
                desc: "Five specialized agents process your requirements, strategy, and tech needs.",
              },
              {
                icon: FileText,
                title: "4. Get Your Prompt",
                desc: "Receive a structured, copy-paste-ready prompt for Cursor or Antigravity.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="group rounded-xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <step.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        Built for hackathon • Powered by Mistral AI
      </footer>
    </div>
  );
}
