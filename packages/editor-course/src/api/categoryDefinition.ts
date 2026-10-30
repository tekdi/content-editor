import type { ApiClient } from './client';
import { URLS } from './urls';

/**
 * One field in a `forms.*` section, as returned by
 * `object/category/definition/v1/read` (sample: `docs/Course.json` in the
 * legacy repo). Consumed by the native dynamic-form renderer (added in M4/M5).
 */
export interface FormFieldDef {
  code: string;
  label?: string;
  dataType?: string;
  inputType?: string;
  required?: boolean;
  editable?: boolean;
  visible?: boolean;
  depends?: string[];
  sourceCategory?: string;
  range?: unknown[];
  terms?: Array<{ name: string; identifier?: string; [key: string]: unknown }>;
  default?: unknown;
  validations?: Array<{ type: string; value?: string; message: string }>;
  [key: string]: unknown;
}

export interface FormSectionDef {
  properties: FormFieldDef[];
}

export interface CategoryDefinitionForms {
  create?: FormSectionDef;
  unitMetadata?: FormSectionDef;
  childMetadata?: FormSectionDef;
  search?: FormSectionDef;
  publishchecklist?: FormSectionDef;
}

export interface CategoryDefinitionResult {
  objectCategoryDefinition: {
    name: string;
    objectType: string;
    forms?: CategoryDefinitionForms;
    objectMetadata?: { config?: Record<string, unknown>; schema?: Record<string, unknown> };
  };
}

/** Port of `EditorService.getCategoryDefinition()`. */
export function fetchCategoryDefinition(
  client: ApiClient,
  primaryCategory: string,
  channel: string,
  objectType: string
): Promise<CategoryDefinitionResult> {
  return client.post<CategoryDefinitionResult>(URLS.categoryDefinition, {
    request: {
      objectCategoryDefinition: { objectType, name: primaryCategory, channel },
    },
  });
}
