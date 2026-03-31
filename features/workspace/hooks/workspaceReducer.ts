import type { WorkspaceState, WorkspaceAction, AgentStatus } from "@/types/workspace";
import { DEFAULT_AGENT_STATUSES } from "@/types/workspace";

export const initialWorkspaceState: WorkspaceState = {
  phase: "idea",
  projectId: null,
  rawIdea: "",
  messages: [],
  inputValue: "",
  pipelineResult: null,
  finalMarkdown: "",
  copied: false,
  agentStatuses: DEFAULT_AGENT_STATUSES.map(a => ({ ...a })),
  activeTab: "brief",
  error: null,
  loading: {
    chat: false,
    pipeline: false,
    history: true,
  },
};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "INIT_PROJECT":
      return {
        ...state,
        projectId: action.payload.projectId,
        rawIdea: action.payload.rawIdea,
        messages: action.payload.messages,
        phase: action.payload.hasMessages ? "chatting" : "idea",
        pipelineResult: null,
        finalMarkdown: "",
        agentStatuses: DEFAULT_AGENT_STATUSES.map(a => ({ ...a })),
        error: null,
      };

    case "RESET_PROJECT":
      return { ...initialWorkspaceState, loading: { ...initialWorkspaceState.loading, history: false } };

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

    case "SET_PIPELINE_RESULT":
      return {
        ...state,
        pipelineResult: action.payload.result,
        finalMarkdown: action.payload.markdown,
        phase: "done",
        agentStatuses: state.agentStatuses.map(a => ({ ...a, status: "done" })),
      };

    case "UPDATE_AGENT_STATUS":
      return {
        ...state,
        agentStatuses: state.agentStatuses.map((a, i) =>
          i === action.payload.index ? { ...a, status: action.payload.status } : a
        ),
      };

    case "RESET_PIPELINE":
      return {
        ...state,
        pipelineResult: null,
        finalMarkdown: "",
        agentStatuses: DEFAULT_AGENT_STATUSES.map(a => ({ ...a })),
        error: null,
        phase: state.messages.length > 0 ? "chatting" : "idea",
      };

    case "SET_COPIED":
      return { ...state, copied: action.payload };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    default:
      return state;
  }
}
