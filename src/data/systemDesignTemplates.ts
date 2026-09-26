import type { TemplateDefinition } from '@/data/templateTypes';
import { systemDesignTemplatesPrimary } from '@/data/systemDesignTemplates.primary';
import { systemDesignTemplatesExtended } from '@/data/systemDesignTemplates.extended';

export const systemDesignTemplates: TemplateDefinition[] = [
  ...systemDesignTemplatesPrimary,
  ...systemDesignTemplatesExtended,
];
