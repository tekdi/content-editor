import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { EditorMountContext, EditorPluginInterface } from '@editor/editor-core';
import { ContentEditorView } from './ContentEditorView';
import type { ContentEditorData } from './types';

export class ContentEditor implements EditorPluginInterface {
  private root: Root | null = null;
  private emotionCache: EmotionCache | null = null;
  private data: ContentEditorData = { title: '', html: '' };

  mount(container: HTMLElement, context: EditorMountContext): void {
    this.data = { title: '', html: '', ...(context.data as ContentEditorData) };
    // MUI/Emotion injects its <style> tags into document.head by default, which
    // never reaches a shadow tree — scope the cache to whatever root actually
    // contains this component (the shadow root, or the document if there isn't one).
    const styleRoot = container.getRootNode();
    const styleContainer = styleRoot instanceof ShadowRoot ? styleRoot : document.head;
    // Fixed key is safe even with multiple instances — each cache is scoped to its own
    // shadow root, and Emotion keys only need to be unique within a style-injection root.
    this.emotionCache = createCache({ key: 'ec', container: styleContainer });
    this.root = createRoot(container);
    this.renderView(context);
    context.emit('editor:ready');
  }

  unmount(): void {
    this.root?.unmount();
    this.root = null;
  }

  getData(): ContentEditorData {
    return this.data;
  }

  setData(data: ContentEditorData): void {
    this.data = data;
  }

  private renderView(context: EditorMountContext): void {
    if (!this.emotionCache) return;
    this.root?.render(
      React.createElement(
        CacheProvider,
        { value: this.emotionCache },
        React.createElement(ContentEditorView, {
          data: this.data,
          options: context.options,
          theme: context.theme,
          readOnly: context.readOnly,
          onChange: (next: ContentEditorData) => {
            this.data = next;
            context.emit('editor:change', next);
          },
          onSave: (next: ContentEditorData, mode: 'draft' | 'submit') => {
            this.data = next;
            context.emit('editor:save', { ...next, mode });
          },
        })
      )
    );
  }
}
