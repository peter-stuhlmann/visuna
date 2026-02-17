import { z } from 'zod';

export const createPageSchema = z.object({
  name: z.string().min(1, 'Seitenname ist erforderlich.'),
  slug: z.string().min(1, 'Slug ist erforderlich.'),
  workspaceId: z.string().min(1, 'workspaceId ist erforderlich.'),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;

export const updatePageSchema = z.object({
  workspaceId: z.string().min(1),
  publishStatus: z.enum(['offline', 'maintenance', 'live']),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
