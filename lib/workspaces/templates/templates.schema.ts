import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Templatename ist erforderlich.'),
  template: z.enum(['header', 'footer', 'forms', 'gallery']),
  workspaceId: z.string().min(1, 'workspaceId ist erforderlich.'),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  publishStatus: z.enum(['active', 'inactive']).optional(),
  data: z.any().optional(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
