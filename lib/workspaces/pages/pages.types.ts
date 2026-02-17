import {
  PageElement,
  PageElementRef,
} from './page-elements/page-elements.types';

export type PageVisibility = 'offline' | 'maintenance' | 'live';

/* ---------- API / Domain ---------- */

export type PageDB = {
  _id: string;
  name: string;
  slug: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  publishStatus: PageVisibility;
  seo: any;
  pageElements: PageElementRef[];
  headerTemplateId?: string;
  footerTemplateId?: string;
};

export type PageInsert = Omit<PageDB, '_id'>;

export type Page = Omit<PageDB, 'pageElements'> & {
  pageElements: PageElement[];
};

export type PageSummary = {
  _id: string;
  name: string;
  slug: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
  publishStatus: PageVisibility;
  workspaceId: string;
};

/* ---------- DTOs ---------- */

export type SearchResult = {
  id: string;
  label: string;
  href: string;
  subtitle?: string;
};
