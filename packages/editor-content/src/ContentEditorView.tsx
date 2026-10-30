import React, { useEffect, useRef, useState } from 'react';
import type { EditorThemeConfig } from '@editor/editor-core';
import { CategorySelector } from './CategorySelector';
import { UploadStep } from './UploadStep';
import { FileListStep } from './FileListStep';
import type {
  ContentEditorData,
  ContentEditorOptions,
  ContentEditorPrimaryCategory,
  ContentEditorToolbarItem,
  ContentEditorUploadItem,
} from './types';

export interface ContentEditorViewProps {
  data: ContentEditorData;
  options?: ContentEditorOptions;
  theme?: EditorThemeConfig;
  readOnly?: boolean;
  onChange: (data: ContentEditorData) => void;
  /** Fired by the uploaded-files step's "Save as Drafts" / "Submit for Review" actions. */
  onSave?: (data: ContentEditorData, mode: 'draft' | 'submit') => void;
}

const DEFAULT_SUPPORTED_FORMATS = ['PDF', 'MP4', 'WebM', 'MP3', 'WAV', 'EPUB', 'H5P', 'HTML ZIP'];
const DEFAULT_ALLOWED_EXTENSIONS = ['pdf', 'mp4', 'webm', 'mp3', 'wav', 'epub', 'h5p', 'zip'];
const DEFAULT_CONTENT_TYPE_OPTIONS = ['Document', 'Video', 'Audio', 'eBook', 'Interactive', 'Other'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function classifyFile(file: File, allowedExtensions: string[]): ContentEditorUploadItem {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const supported = allowedExtensions.includes(ext);
  return {
    id: `f-${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
    kind: 'file',
    name: file.name,
    sizeLabel: formatBytes(file.size),
    status: supported ? 'uploaded' : 'failed',
    statusMessage: supported ? undefined : 'Unsupported format',
    metadataProgress: supported ? 11 : 0,
  };
}

function classifyYoutubeUrl(url: string): ContentEditorUploadItem {
  return {
    id: `yt-${url}-${Math.random().toString(36).slice(2)}`,
    kind: 'youtube',
    name: url,
    status: 'uploaded',
    metadataProgress: 11,
  };
}

const DEFAULT_TOOLBAR: ContentEditorToolbarItem[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'bulletList',
  'orderedList',
  'link',
];

const TOOLBAR_LABELS: Record<ContentEditorToolbarItem, string> = {
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strike: 'S',
  bulletList: '•',
  orderedList: '1.',
  link: '🔗',
};

const TOOLBAR_COMMANDS: Record<ContentEditorToolbarItem, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strike: 'strikeThrough',
  bulletList: 'insertUnorderedList',
  orderedList: 'insertOrderedList',
  link: 'createLink',
};

export function ContentEditorView({ data, options, theme, readOnly, onChange, onSave }: ContentEditorViewProps): React.JSX.Element {
  const [title, setTitle] = useState(data.title ?? '');
  const [category, setCategory] = useState(data.category);
  const [items, setItems] = useState<ContentEditorUploadItem[]>(data.items ?? []);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toolbar = options?.toolbar ?? DEFAULT_TOOLBAR;
  const showTitle = options?.showTitle !== false;
  const primaryCategories = options?.primaryCategories;
  const showCategoryStep = !!primaryCategories?.length && !category;
  const showUploadStep = !showCategoryStep && !!primaryCategories?.length && items.length === 0;
  const showFileListStep = !showCategoryStep && !!primaryCategories?.length && items.length > 0;

  // contentEditable owns its DOM after this initial paint — we never re-render
  // its innerHTML from props, only read from it on change. Re-runs once the
  // category step (if any) hands off to this view, since bodyRef only exists then.
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = data.html || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCategoryStep]);

  const emitChange = (nextTitle: string): void => {
    onChange({ title: nextTitle, html: bodyRef.current?.innerHTML ?? '', category, items });
  };

  const emitState = (patch: Partial<ContentEditorData> = {}): void => {
    onChange({ title, html: data.html, category, items, ...patch });
  };

  if (showCategoryStep) {
    const handleCategoryContinue = (selected: ContentEditorPrimaryCategory): void => {
      setCategory(selected.value);
      emitState({ category: selected.value });
    };
    return (
      <CategorySelector categories={primaryCategories!} theme={theme} readOnly={readOnly} onContinue={handleCategoryContinue} />
    );
  }

  if (showUploadStep) {
    const configuredFormats = options?.supportedFormats;
    const supportedFormatsDisplay = configuredFormats ?? DEFAULT_SUPPORTED_FORMATS;
    const allowedExtensions = configuredFormats ? configuredFormats.map((f) => f.toLowerCase()) : DEFAULT_ALLOWED_EXTENSIONS;

    const handleFilesAdded = (files: File[]): void => {
      const next = [...items, ...files.map((f) => classifyFile(f, allowedExtensions))];
      setItems(next);
      emitState({ items: next });
    };
    const handleYoutubeAdded = (url: string): void => {
      const next = [...items, classifyYoutubeUrl(url)];
      setItems(next);
      emitState({ items: next });
    };
    const handleBackToCategory = (): void => {
      setCategory(undefined);
      emitState({ category: undefined });
    };

    return (
      <UploadStep
        supportedFormats={supportedFormatsDisplay}
        theme={theme}
        readOnly={readOnly}
        onFilesAdded={handleFilesAdded}
        onYoutubeAdded={handleYoutubeAdded}
        onBack={handleBackToCategory}
      />
    );
  }

  if (showFileListStep) {
    const handleContentTypeChange = (id: string, contentType: string): void => {
      const next = items.map((i) => (i.id === id ? { ...i, contentType } : i));
      setItems(next);
      emitState({ items: next });
    };
    const handleClearAll = (): void => {
      setItems([]);
      emitState({ items: [] });
    };

    return (
      <FileListStep
        items={items}
        contentTypeOptions={options?.contentTypeOptions ?? DEFAULT_CONTENT_TYPE_OPTIONS}
        theme={theme}
        readOnly={readOnly}
        onContentTypeChange={handleContentTypeChange}
        onClearAll={handleClearAll}
        onSaveDrafts={() => onSave?.({ title, html: data.html, category, items }, 'draft')}
        onSubmitForReview={() => onSave?.({ title, html: data.html, category, items }, 'submit')}
      />
    );
  }

  const runCommand = (item: ContentEditorToolbarItem): void => {
    if (readOnly) return;
    bodyRef.current?.focus();
    const command = TOOLBAR_COMMANDS[item];
    if (item === 'link') {
      const url = window.prompt('Enter URL');
      if (!url) return;
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false);
    }
    emitChange(title);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: theme?.background ?? '#ffffff',
        color: '#1a1a1a',
      }}
    >
      {showTitle && (
        <input
          value={title}
          placeholder={options?.placeholder ?? 'Title'}
          disabled={readOnly}
          onChange={(e) => {
            setTitle(e.target.value);
            emitChange(e.target.value);
          }}
          style={{
            border: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            padding: '12px 16px',
            fontSize: 20,
            fontWeight: 600,
            outline: 'none',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          background: theme?.toolbar ?? '#f5f5f7',
        }}
      >
        {toolbar.map((item) => (
          <button
            key={item}
            type="button"
            disabled={readOnly}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCommand(item)}
            title={item}
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 4,
              background: '#ffffff',
              color: theme?.primary ?? '#2980b9',
              padding: '4px 10px',
              fontSize: 13,
              fontWeight: 700,
              cursor: readOnly ? 'default' : 'pointer',
            }}
          >
            {TOOLBAR_LABELS[item]}
          </button>
        ))}
      </div>

      <div
        ref={bodyRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={() => emitChange(title)}
        style={{
          flex: 1,
          padding: 16,
          fontSize: 15,
          lineHeight: 1.6,
          outline: 'none',
          overflowY: 'auto',
        }}
      />
    </div>
  );
}
