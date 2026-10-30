import { registerEditorWrapper } from './registerEditorWrapper';

export { EditorWrapperElement } from './EditorWrapperElement';
export { registerEditorWrapper } from './registerEditorWrapper';
export type {
  EditorWrapperConfig,
  EditorEvent,
  EditorThemeConfig,
  EditorMountContext,
  EditorPluginInterface,
} from '@editor/editor-core';

// Auto-register when loaded as IIFE (plain <script> tag)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  registerEditorWrapper();
}
