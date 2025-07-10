import { AgentStatusCallback } from '../../agent_v2/types';

export interface ChromeAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
}