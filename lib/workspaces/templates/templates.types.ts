export type TemplatePublishStatus = 'active' | 'inactive';
export type TemplateType = 'header' | 'footer' | 'forms' | 'gallery';

/* ---------- DB Document ---------- */

export type TemplateDB = {
  _id: string;
  name: string;
  template: TemplateType;
  workspaceId: string;
  publishStatus: TemplatePublishStatus;
  isDefault?: boolean;
  data: any;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
};

/* ---------- Summary (list view, no data) ---------- */

export type TemplateSummary = {
  _id: string;
  name: string;
  template: TemplateType;
  workspaceId: string;
  publishStatus: TemplatePublishStatus;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
};

