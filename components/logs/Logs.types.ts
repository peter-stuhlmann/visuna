export type Log = {
  email: string;
  activity: string;
  timestamp: string;
};

export type LogsProps = {
  logs: Log[] | null;
};
