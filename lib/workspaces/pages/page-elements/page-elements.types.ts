// lib/workspaces/pages/page-elements/page-elements.types.ts

export type PageElement = {
  _id: string;
  pageId: string;
  data: any;
  order: number;
  element: string;
  visible: boolean;
  name: string;
  createdAt: Date;
};

export type PageElementRef = {
  id: string;
  order?: number;
};
