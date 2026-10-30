export { CourseEditor } from './CourseEditor';
export { CourseEditorView } from './CourseEditorView';
export type {
  CourseEditorMountData,
  LegacyEditorContext,
  LegacyEditorConfig,
  LegacyHierarchyLevelConfig,
  LegacyEditableFieldsByMode,
  LegacyPdata,
  LegacyContextRollup,
  LegacyUser,
  CourseEditorSavePayload,
  HierarchyNodeWire,
  NodeModifiedWire,
} from './types';

export { ApiClient, createApiClient } from './api/client';
export type { ApiClientConfig } from './api/client';
export { URLS } from './api/urls';
export { ApiError } from './api/types';
export type { ServerResponse, ServerResponseParams } from './api/types';

export { fetchHierarchy, updateHierarchy } from './api/hierarchy';
export type { HierarchyReadResult } from './api/hierarchy';

export { fetchCategoryDefinition } from './api/categoryDefinition';
export type {
  CategoryDefinitionResult,
  CategoryDefinitionForms,
  FormSectionDef,
  FormFieldDef,
} from './api/categoryDefinition';
