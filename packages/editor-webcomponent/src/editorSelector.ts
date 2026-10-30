import type { EditorPluginInterface } from '@editor/editor-core';
import { ContentEditor } from '@editor/editor-content';
import { CourseEditor } from '@editor/editor-course';

/**
 * Composition point: maps an editorType discriminant to its plugin package.
 * Add a new sub-editor by importing its package here and registering its type key.
 */
export function editorSelector(editorType: string): EditorPluginInterface | null {
  if (editorType === 'content') return new ContentEditor();
  if (editorType === 'course') return new CourseEditor();
  return null;
}
