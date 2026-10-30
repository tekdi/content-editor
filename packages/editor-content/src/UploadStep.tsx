import React, { useRef, useState } from 'react';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { EditorThemeConfig } from '@editor/editor-core';

export interface UploadStepProps {
  supportedFormats: string[];
  theme?: EditorThemeConfig;
  readOnly?: boolean;
  onFilesAdded: (files: File[]) => void;
  onYoutubeAdded: (url: string) => void;
  onBack: () => void;
}

const YOUTUBE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/i;

export function UploadStep({
  supportedFormats,
  theme,
  readOnly,
  onFilesAdded,
  onYoutubeAdded,
  onBack,
}: UploadStepProps): React.JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const primary = theme?.primary ?? '#2980b9';

  const handleFiles = (fileList: FileList | null): void => {
    if (!fileList || fileList.length === 0 || readOnly) return;
    onFilesAdded(Array.from(fileList));
  };

  const submitYoutubeUrl = (): void => {
    const url = youtubeUrl.trim();
    if (!url) return;
    if (!YOUTUBE_URL_PATTERN.test(url)) {
      setYoutubeError('Enter a valid YouTube URL');
      return;
    }
    setYoutubeError(null);
    setYoutubeUrl('');
    onYoutubeAdded(url);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: 32,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: theme?.background ?? '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div
          onClick={() => !readOnly && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!readOnly) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          style={{
            border: `2px dashed ${isDragOver ? primary : '#c9ced6'}`,
            borderRadius: 10,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: readOnly ? 'default' : 'pointer',
            background: isDragOver ? '#f4f9fc' : 'transparent',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            disabled={readOnly}
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          <FileUploadOutlinedIcon style={{ width: 32, height: 32, fill: '#4a5568' }} />
          <p style={{ margin: '16px 0 6px', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            Drag a file here or click to browse
          </p>
          <p style={{ margin: 0, fontSize: 13, color: primary }}>
            Supported formats: {supportedFormats.join(', ')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e2e5ea' }} />
          <span style={{ fontSize: 13, color: '#8a94a3' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#e2e5ea' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <LinkIcon style={{ width: 18, height: 18, fill: '#4a5568' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>YouTube URL</span>
        </div>
        <input
          value={youtubeUrl}
          disabled={readOnly}
          placeholder="https://www.youtube.com/watch?v=..."
          onChange={(e) => {
            setYoutubeUrl(e.target.value);
            if (youtubeError) setYoutubeError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitYoutubeUrl();
          }}
          onBlur={submitYoutubeUrl}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${youtubeError ? '#e53e3e' : '#d7dbe1'}`,
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        {youtubeError && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#e53e3e' }}>{youtubeError}</p>}

        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 32,
            padding: '10px 18px',
            borderRadius: 6,
            border: '1px solid #d7dbe1',
            background: '#ffffff',
            fontSize: 14,
            fontWeight: 600,
            color: '#1a1a1a',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <ArrowBackIcon style={{ width: 16, height: 16, fill: '#1a1a1a' }} />
          Back
        </button>
      </div>
    </div>
  );
}
