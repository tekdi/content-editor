/**
 * Adopted as-is from the legacy Angular collection-editor's `IEditorConfig`
 * (`sunbird-collection-editor/projects/collection-editor-library/src/lib/interfaces/editor.ts`,
 * documented field-by-field in `docs/CONFIGURATION.md`). Not reshaped: the host
 * app that already produces this JSON for `<lib-editor>` needs no changes to
 * point at `<editor-wrapper editorType="course">` instead.
 */

export interface LegacyPdata {
  id: string;
  ver: string;
  pid: string;
}

export interface LegacyContextRollup {
  l1?: string;
  l2?: string;
  l3?: string;
  l4?: string;
}

export interface LegacyUser {
  id: string;
  orgIds?: string[];
  organisations?: Record<string, unknown>;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  isRootOrgAdmin?: boolean;
}

export interface LegacyEditorContext {
  // Telemetry context
  env: string;
  sid: string;
  did: string;
  uid: string;
  channel: string;
  pdata: LegacyPdata;
  contextRollup: LegacyContextRollup;
  tags: string[];
  cdata?: unknown[];
  timeDiff?: number;
  objectRollup?: Record<string, unknown>;
  host?: string;
  endpoint?: string;
  userData?: { firstName: string; lastName: string };

  // Editor context
  framework: string;
  user: LegacyUser;
  identifier?: string;
  authToken?: string;
  mode?: string;
  programId?: string;
  contributionOrgId?: string;
  defaultLicense?: string;
  cloudStorageUrls?: string[];
  additionalCategories?: Array<{ value: string; label: string }>;
  labels?: Record<string, string>;
  targetFWIds?: string[];
  cloudStorage?: { provider: string; presigned_headers: Record<string, string> };
}

export interface LegacyHierarchyLevelConfig {
  name: string;
  type: string;
  mimeType: string;
  contentType: string;
  primaryCategory?: string;
  iconClass?: string;
  /** e.g. `{ Content: [...], QuestionSet: [...] }` — the per-level add-child whitelist. */
  children?: Record<string, string[]>;
}

export type LegacyEditableFieldsByMode = {
  sourcingreview: string[];
  orgreview: string[];
  review: string[];
};

export interface LegacyEditorConfig {
  mode?: 'edit' | 'review' | 'read' | 'sourcingReview' | 'orgReview';
  editableFields?: LegacyEditableFieldsByMode;
  maxDepth: number;
  dialcodeMinLength?: number;
  dialcodeMaxLength?: number;
  showAddCollaborator?: boolean;
  enableBulkUpload?: boolean;
  publicStorageAccount?: string;
  assetConfig?: Record<string, unknown>;
  objectType: string;
  primaryCategory: string;
  isRoot: boolean;
  iconClass?: string;
  children?: Record<string, string[]>;
  hierarchy: Record<string, LegacyHierarchyLevelConfig>;
  contentPolicyUrl?: string;
}

/** Shape of `context.data` (`EditorMountContext['data']`) for `editorType: 'course'`. */
export interface CourseEditorMountData {
  context: LegacyEditorContext;
  config: LegacyEditorConfig;
}

// --- Save wire format ---------------------------------------------------
// Mirrors the flat `{nodesModified, hierarchy}` payload PATCHed to
// `content/v3/hierarchy/update`, produced by `EditorService.getHierarchyObj()`
// in the legacy library. This is the target shape `getData()`/`setData()`
// and the normalized tree store's `serializeForSave()` (added in M2/M6) work with.

export interface HierarchyNodeWire {
  name: string;
  children: string[];
  root: boolean;
  relationalMetadata?: Record<string, unknown>;
}

export interface NodeModifiedWire {
  root: boolean;
  objectType: string;
  metadata: Record<string, unknown>;
  isNew: boolean;
}

export interface CourseEditorSavePayload {
  nodesModified: Record<string, NodeModifiedWire>;
  hierarchy: Record<string, HierarchyNodeWire>;
}
