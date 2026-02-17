export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClientAction = {
  type: 'navigate' | 'set_preview_language' | 'set_preview_device';
  payload: any;
};

export type ToolAction = {
  name: string;
  result: any;
  clientAction?: ClientAction;
};

export type ChatResponse = {
  reply: string;
  actions: ToolAction[];
  error?: string;
};
