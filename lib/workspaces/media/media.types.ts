export type MediaLocalizedField = Record<string, string>;

export type MediaMeta = {
  alt?: MediaLocalizedField;
  title?: MediaLocalizedField;
  caption?: MediaLocalizedField;
  copyright?: MediaLocalizedField;
};

export type MediaDoc = {
  publicId: string;
  workspaceId: string;
  secureUrl: string;
  url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  meta: MediaMeta;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  phash?: string;
};
