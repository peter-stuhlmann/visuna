// components/pages/PagesFilter.types.ts

import { PageVisibility } from "@/lib/workspaces/pages/pages.types";


export type PagesFilter = {
  status: PageVisibility | 'all';
  name: string;
  slug: string;
  dateFrom: string; // yyyy-mm-dd
  dateTo: string; // yyyy-mm-dd
};
