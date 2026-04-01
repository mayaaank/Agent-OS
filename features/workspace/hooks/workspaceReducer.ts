'EOF'
// =============================================================================
// Agent OS — Workspace Reducer
// =============================================================================
// PHASE 3: SET_PIPELINE_RESULT now populates confidence per AgentStatus.
//          SET_FEEDBACK_VALUE added for feedback input state.

import type { WorkspaceState, WorkspaceAction } from "@/types/workspace";
import { DEFAULT_AGENT_STATUSES } from "@/types/workspace";
import type { AgentName } from "@/types";

// Maps AgentStatus display names → AgentName keys for confidence lookup
const AGENT_NAME_MAP: Record<string, AgentName> = {
  "Requirement Analyst": "requirement_analyst",
  "Product Strategist": "product_strategist",
  "Technical Architect": "technical_architect",
  "Prompt Engineer": "prompt_engineer",
};

export const initialWorkspaceState: WorkspaceState = {
  phase: "idea",
  projectId: null,
  rawIdea: "",
  messages: [],
  inputValue: "",
  pipelineResult: null,
  finalMarkdown: "",
  copied: false,
  agentStatuses: DEFAULT_AGENT_STATUSES.map((a) => ({ ...a })),
  activeTab: "brief",
  error: null,
  loading: {
    chat: false,
    pipeline: false,
    history: true,
  },
  feedbackValue: "",  // PHASE 3
};

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {

    case "LOAD_PROJECT":
      return {
        ...state,
        projectId: action.payload.projectId,
        rawIdea: action.payload.rawIdea,
        messages: action.payload.messages,
        pipelineResult: action.payload.pipelineResult,
        finalMarkdown: action.payload.finalMarkdown,
        phase: action.payload.isCompleted
          ? "done"
          : action.payload.hasMessages
            ? "chatting"
            : "idea",
        agentStatuses: action.payload.isCompleted
          ? DEFAULT_AGENT_STATUSES.map((a) => ({ ...a, status: "done" as const }))
          : DEFAULT_AGENT_STATUSES.map((a) => ({ ...a })),
        error: null,
        feedbackValue: "",
      };

    case "INIT_PROJECT":
      return {
        ...state,
        projectId: action.payload.projectId,
        rawIdea: action.payload.rawIdea,
        messages: action.payload.messages,
        phase: action.payload.hasMessages ? "chatting" : "idea",
        pipelineResult: null,
        finalMarkdown: "",
        agentStatuses: DEFAULT_AGENT_STATUSES.map((a) => ({ ...a })),
        error: null,
        feedbackValue: "",
      };

    case "RESET_PROJECT":
      return {
        ...initialWorkspaceState,
        loading: { ...initialWorkspaceState.loading, history: false },
      };

    case "SET_PHASE":
      return { ...state, phase: action.payload };

    case "SET_RAW_IDEA":
      return { ...state, rawIdea: action.payload };

    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_LOADING":
      return { ...state, loading: { ...state.loading, ...action.payload } };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    // PHASE 3: Populate confidence scores from PipelineResult into AgentStatus
    case "SET_PIPELINE_RESULT":
      return {
        ...state,
        pipelineResult: action.payload.result,
        finalMarkdown: action.payload.markdown,
        phase: "done",
        feedbackValue: "",
        agentStatuses: state.agentStatuses.map((a) => {
          const agentKey = AGENT_NAME_MAP[a.name];
          const confidence = agentKey
            ? action.payload.result.confidenceScores?.[agentKey]
            : undefined;
          return {
            ...a,
            status: "done" as const,
            confidence,  // PHASE 3: undefined if agent didn't report it
          };
        }),
      };

    case "UPDATE_AGENT_STATUS":
      return {
        ...state,
        agentStatuses: state.agentStatuses.map((a, i) =>
          i === action.payload.index
            ? { ...a, status: action.payload.status }
            : a
        ),
      };

    case "RESET_PIPELINE":
      return {
        ...state,
        pipelineResult: null,
        finalMarkdown: "",
        feedbackValue: "",
        agentStatuses: DEFAULT_AGENT_STATUSES.map((a) => ({ ...a })),
        error: null,
        phase: state.messages.length > 0 ? "chatting" : "idea",
      };

    case "SET_COPIED":
      return { ...state, copied: action.payload };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    // PHASE 3
    case "SET_FEEDBACK_VALUE":
      return { ...state, feedbackValue: action.payload };

    default:
      return state;
  }
}