import React, { useState } from 'react';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { EditorThemeConfig } from '@editor/editor-core';
import type { ContentEditorUploadItem } from './types';

export interface FileListStepProps {
  items: ContentEditorUploadItem[];
  contentTypeOptions: string[];
  theme?: EditorThemeConfig;
  readOnly?: boolean;
  onContentTypeChange: (id: string, contentType: string) => void;
  onClearAll: () => void;
  onSaveDrafts: () => void;
  onSubmitForReview: () => void;
}

// Table layout needs to reflow at narrow widths, which inline style={} can't
// express — kept in a small scoped <style> tag like the category grid.
const RESPONSIVE_STYLES = `
  .ce-file-table { width: 100%; border-collapse: collapse; }
  .ce-file-table th, .ce-file-table td { padding: 12px 10px; text-align: left; vertical-align: middle; }
  .ce-file-table thead th { font-size: 12px; color: #6b7280; border-bottom: 1px solid #e2e5ea; }
  .ce-file-table tbody tr { border-bottom: 1px solid #eef0f3; }
  .ce-file-actions { display: flex; justify-content: flex-end; gap: 12px; }
  @media (max-width: 699px) {
    .ce-file-table thead { display: none; }
    .ce-file-table, .ce-file-table tbody, .ce-file-table tr, .ce-file-table td { display: block; width: 100%; }
    .ce-file-table tbody tr { padding: 12px 0; }
    .ce-file-table td { padding: 4px 0; }
    .ce-file-actions { justify-content: stretch; flex-direction: column; }
    .ce-file-actions button { width: 100%; }
  }
`;

export function FileListStep({
  items,
  contentTypeOptions,
  theme,
  readOnly,
  onContentTypeChange,
  onClearAll,
  onSaveDrafts,
  onSubmitForReview,
}: FileListStepProps): React.JSX.Element {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const primary = theme?.primary ?? '#2980b9';
  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleAll = (): void => {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const toggleOne = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        padding: 24,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: theme?.background ?? '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <style>{RESPONSIVE_STYLES}</style>

      <table className="ce-file-table">
        <thead>
          <tr>
            <th style={{ width: 32 }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={readOnly} />
            </th>
            <th>File</th>
            <th>Status</th>
            <th>Content Type</th>
            <th>Metadata</th>
            <th style={{ width: 24 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const RowIcon = item.kind === 'youtube' ? OndemandVideoOutlinedIcon : InsertDriveFileOutlinedIcon;
            const failed = item.status === 'failed';
            return (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleOne(item.id)}
                    disabled={readOnly}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <RowIcon style={{ width: 20, height: 20, fill: '#6b7280', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, color: '#1a1a1a', wordBreak: 'break-all' }}>{item.name}</div>
                      {item.sizeLabel && <div style={{ fontSize: 12, color: '#8a94a3' }}>{item.sizeLabel}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    {failed ? (
                      <CloseIcon style={{ width: 16, height: 16, fill: '#e53e3e' }} />
                    ) : (
                      <CheckIcon style={{ width: 16, height: 16, fill: '#2f9e44' }} />
                    )}
                    <span style={{ color: failed ? '#e53e3e' : '#2f9e44' }}>
                      {failed ? `Failed${item.statusMessage ? ` · ${item.statusMessage}` : ''}` : 'Uploaded'}
                    </span>
                  </div>
                </td>
                <td>
                  <select
                    value={item.contentType ?? ''}
                    disabled={readOnly || failed}
                    onChange={(e) => onContentTypeChange(item.id, e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: 160,
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #d7dbe1',
                      fontSize: 13,
                      background: '#ffffff',
                      color: item.contentType ? '#1a1a1a' : '#8a94a3',
                    }}
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {contentTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e5ea', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.metadataProgress}%`,
                          height: '100%',
                          background: primary,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{item.metadataProgress}%</span>
                  </div>
                </td>
                <td>
                  <ChevronRightIcon style={{ width: 18, height: 18, fill: '#8a94a3' }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={onClearAll}
          disabled={readOnly}
          style={{
            border: 'none',
            background: 'none',
            color: primary,
            fontSize: 14,
            fontWeight: 600,
            cursor: readOnly ? 'default' : 'pointer',
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          Clear all
        </button>

        <div className="ce-file-actions">
          <button
            type="button"
            onClick={onSaveDrafts}
            disabled={readOnly}
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              border: '1px solid #d7dbe1',
              background: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              color: '#1a1a1a',
              cursor: readOnly ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save All as Drafts
          </button>
          <button
            type="button"
            onClick={onSubmitForReview}
            disabled={readOnly}
            style={{
              padding: '10px 18px',
              borderRadius: 6,
              border: 'none',
              background: primary,
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffff',
              cursor: readOnly ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Submit All for Review
          </button>
        </div>
      </div>
    </div>
  );
}
