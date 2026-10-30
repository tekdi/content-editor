import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { EditorMountContext, EditorPluginInterface } from '@editor/editor-core';
import { CourseEditorView } from './CourseEditorView';
import { createApiClient, type ApiClient } from './api/client';
import type { CourseEditorMountData, CourseEditorSavePayload } from './types';

export class CourseEditor implements EditorPluginInterface {
  private root: Root | null = null;
  private mountData: CourseEditorMountData | null = null;
  private apiClient: ApiClient | null = null;

  mount(container: HTMLElement, context: EditorMountContext): void {
    this.mountData = context.data as CourseEditorMountData;
    this.apiClient = createApiClient(this.mountData, context.options);
    this.root = createRoot(container);
    this.renderView(context);
    context.emit('editor:ready');
  }

  unmount(): void {
    this.root?.unmount();
    this.root = null;
  }

  getData(): CourseEditorSavePayload {
    // Normalized tree state (and its serialization into this wire format)
    // lands in M2/M6 — until then there's nothing to report.
    return { nodesModified: {}, hierarchy: {} };
  }

  setData(): void {
    // Hydration into normalized tree state lands in M2.
  }

  private renderView(context: EditorMountContext): void {
    if (!this.mountData) return;
    this.root?.render(
      React.createElement(CourseEditorView, {
        mountData: this.mountData,
        apiClient: this.apiClient,
        theme: context.theme,
        readOnly: context.readOnly,
      })
    );
  }
}
