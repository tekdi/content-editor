/**
 * Host-provided config for every shell component. Extra keys are passed
 * through untouched so the contract can grow without breaking existing hosts.
 * Auth is not part of config — `localStorage.token` and `localStorage.tenantId` are read per request.
 */
/** Host branding. Every key is optional; anything left out keeps the default MUI look. */
export interface ShellThemeConfig {
  /** Main brand color: buttons, links, active states (any CSS color, e.g. `#2980b9`). */
  primary?: string;
  /** Accent color: course counts in the list. */
  secondary?: string;
  /** Button corners: `square` (0), `rounded` (4px, default) or `pill` (fully round). */
  buttonShape?: 'square' | 'rounded' | 'pill';
}

export interface ShellManageConfig {
  baseurl: string;
  channel: string;
  /** Required to create a shell. */
  framework?: string;
  createdBy?: string;
  createdFor?: string[];
  targetFWIds?: string[];
  /** Required to update a shell (user id sent as `lastUpdatedBy`). */
  lastUpdatedBy?: string;
  theme?: ShellThemeConfig;
  [key: string]: unknown;
}

/**
 * Events dispatched to the host (`bubbles` + `composed`). Add new ones here —
 * hosts subscribe by name, so existing names and payloads must stay stable.
 */
export const SHELL_EVENTS = [
  'shell:ready', // { identifier } — form definition loaded
  'shell:list-loaded', // { count, offset, limit, query }
  'shell:create-open', // {}
  'shell:edit-open', // { identifier }
  'shell:courses-open', // { identifier, count } — course list popup opened
  'shell:submit', // { values } — form validated, before the API call
  'shell:created', // { identifier, versionKey, values }
  'shell:updated', // { identifier, versionKey, shell }
  'shell:cancel', // {}
  'shell:back', // {} — header back button clicked; the host decides where to navigate
  'shell:error', // { message, cause }
] as const;

export type ShellEvent = (typeof SHELL_EVENTS)[number];

export type EmitFn = (event: ShellEvent, detail?: unknown) => void;

export interface FieldValidation {
  type: 'required' | 'maxLength' | string;
  value?: string | number;
  message?: string;
}

export interface FormField {
  code: string;
  name?: string;
  label?: string;
  description?: string;
  dataType?: string;
  inputType: string;
  placeholder?: string;
  required?: boolean;
  visible?: boolean;
  editable?: boolean;
  default?: unknown;
  renderingHints?: Record<string, unknown>;
  validations?: FieldValidation[];
}

export interface FormSection {
  name?: string;
  fields: FormField[];
}

export interface FormDefinition {
  templateName?: string;
  required?: string[];
  properties: FormSection[];
}

export interface CategoryDefinition {
  identifier: string;
  name: string;
  label?: string;
  objectMetadata?: Record<string, unknown>;
  forms?: {
    create?: FormDefinition;
    [formName: string]: FormDefinition | undefined;
  };
}

export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;

/** A shell as returned by composite search (only the fields the UI relies on are typed). */
export interface ShellRecord {
  identifier: string;
  versionKey: string;
  name: string;
  description?: string;
  keywords?: string[];
  status?: string;
  framework?: string;
  createdOn?: string;
  lastUpdatedOn?: string;
  [key: string]: unknown;
}

/** A Live course built on a shell, as returned by composite search. */
export interface CourseRecord {
  identifier: string;
  name: string;
  description?: string;
  status?: string;
  appIcon?: string;
  se_gradeLevels?: string[];
  se_subjects?: string[];
  lastUpdatedOn?: string;
  [key: string]: unknown;
}

export interface CourseSearchResult {
  count: number;
  content: CourseRecord[];
}

export interface ShellSearchParams {
  query?: string;
  limit: number;
  offset: number;
}

export interface ShellSearchResult {
  count: number;
  content: ShellRecord[];
}

/** Whether a shell can be edited: only while no Live course uses it. */
export type ShellUsage =
  | { status: 'queued' }
  | { status: 'checking' }
  | { status: 'unused' }
  | { status: 'used'; count: number }
  | { status: 'error'; message: string };

