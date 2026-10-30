import { EditorWrapperElement } from './EditorWrapperElement';

interface RegisterOptions {
  tagName?: string;
}

/**
 * Idempotent — safe to call multiple times.
 */
export function registerEditorWrapper(options: RegisterOptions = {}): void {
  const tag = options.tagName ?? 'editor-wrapper';
  if (customElements.get(tag)) return;
  customElements.define(tag, EditorWrapperElement);
}
