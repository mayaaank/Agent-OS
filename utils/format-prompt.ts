// ===========================================
// Agent OS — Prompt Formatter
// ===========================================
// Converts FinalPromptData into a polished Markdown string.

import type { FinalPromptData } from "@/types";

/** Coerce a value that should be string[] into an actual array.
 *  LLMs sometimes return a single string instead of an array,
 *  or nest arrays / objects. This normalises the value safely. */
function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function formatFinalPrompt(data: FinalPromptData): string {
  const stackLines = Object.entries(data.suggested_stack ?? {})
    .map(([key, val]) => `- **${capitalize(key)}:** ${val}`)
    .join("\n");

  const featuresLines = ensureArray(data.features).map((f) => `- ${f}`).join("\n");
  const flowLines = ensureArray(data.core_flows).map((f, i) => `${i + 1}. ${f}`).join("\n");
  const pagesLines = ensureArray(data.pages_and_components).map((p) => `- ${p}`).join("\n");
  const dataLines = ensureArray(data.data_model).map((d) => `- ${d}`).join("\n");
  const constraintLines = ensureArray(data.constraints).map((c) => `- ${c}`).join("\n");
  const futureLines = ensureArray(data.future_enhancements).map((f) => `- ${f}`).join("\n");
  const userLines = ensureArray(data.target_users).map((u) => `- ${u}`).join("\n");

  return `# ${data.product_name}

> ${data.concept}

---

## Problem Statement
${data.problem_statement}

## Target Users
${userLines}

## MVP Goal
${data.mvp_goal}

## Core Features
${featuresLines}

## Core User Flow
${flowLines}

## Suggested Tech Stack
${stackLines}

## Pages & Components
${pagesLines}

## Data Model
${dataLines}

## Constraints
${constraintLines}

## Future Enhancements
${futureLines}

---

## Build Instruction

${data.build_instruction}
`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
