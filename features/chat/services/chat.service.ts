// ===========================================
// Agent OS — Chat Service
// ===========================================
// Handles all communication with /api/chat.

import type { ChatMessage } from "@/types";
import { logger } from "@/lib/logger";

export interface ChatServiceResult {
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatServiceResult> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        (errBody as { error?: string })?.error ?? `Chat failed (${res.status})`
      );
    }

    const data = await res.json();
    return { content: data.content as string };
  } catch (error) {
    logger.error("Chat service failed", { error });
    throw error;
  }
}

// Basic input validation
export function validateChatInput(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { valid: false, error: "Message is too long." };
  return { valid: true };
}
