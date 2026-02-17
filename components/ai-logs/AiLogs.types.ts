import { AiLogFormatted } from '@/app/(backend)/workspaces/[workspaceId]/ai-logs/helpers/getAiLogs';

export type AiLogsProps = {
  logs: AiLogFormatted[];
  stats: {
    totalTokens: number;
    totalCostEurCent: number;
    count: number;
  };
};
