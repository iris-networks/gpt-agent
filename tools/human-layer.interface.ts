export interface HumanLayerRequest {
    id: string;
    title: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'timed_out';
    timestamp: number;
    timeoutAt: number;
  }
  