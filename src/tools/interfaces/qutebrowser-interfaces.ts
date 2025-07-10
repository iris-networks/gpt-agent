import { AgentStatusCallback } from '../../agent_v2/types';

export interface QutebrowserAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
}