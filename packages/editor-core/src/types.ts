export type EditorEvent = 'editor:ready' | 'editor:change' | 'editor:save' | 'editor:error' | 'editor:close';

export interface EditorThemeConfig {
  primary?: string;
  toolbar?: string;
  background?: string;
}

/** The runtime config object set on the wrapper element (e.g. `el.editorConfig = {...}`). */
export interface EditorWrapperConfig {
  editorType: string;
  data?: unknown;
  options?: Record<string, unknown>;
  theme?: EditorThemeConfig;
  readOnly?: boolean;
}

export function isEditorWrapperConfig(val: unknown): val is EditorWrapperConfig {
  return !!val && typeof val === 'object' && typeof (val as Record<string, unknown>).editorType === 'string';
}

export interface EditorMountContext {
  data?: unknown;
  options?: Record<string, unknown>;
  theme?: EditorThemeConfig;
  readOnly?: boolean;
  emit: (event: EditorEvent, payload?: unknown) => void;
}

/** Contract every sub-editor package implements. The wrapper only ever talks to this interface. */
export interface EditorPluginInterface {
  mount(container: HTMLElement, context: EditorMountContext): Promise<void> | void;
  unmount(): Promise<void> | void;
  getData(): unknown;
  setData(data: unknown): void;
}
