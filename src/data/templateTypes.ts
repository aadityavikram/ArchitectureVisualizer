import type { ArchitectureProject } from '@/types/architecture';

export type TemplateCategory = 'patterns' | 'system-design';

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  category?: TemplateCategory;
  build: () => ArchitectureProject;
};
