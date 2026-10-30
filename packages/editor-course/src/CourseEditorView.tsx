import React, { useEffect, useState } from 'react';
import type { EditorThemeConfig } from '@editor/editor-core';
import type { ApiClient } from './api/client';
import { fetchCategoryDefinition, type CategoryDefinitionResult } from './api/categoryDefinition';
import type { CourseEditorMountData } from './types';

export interface CourseEditorViewProps {
  mountData: CourseEditorMountData;
  apiClient: ApiClient | null;
  theme?: EditorThemeConfig;
  readOnly?: boolean;
}

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * M1 placeholder shell: confirms the plugin mounts, the legacy `IEditorConfig`
 * shape flows through, and the API client can reach a real backend. The tree
 * (M2/M3), metadata forms (M4/M5), and toolbar (M6) replace this in later
 * milestones — see the plan's milestone sequence.
 */
export function CourseEditorView({ mountData, apiClient, theme, readOnly }: CourseEditorViewProps): React.JSX.Element {
  const { context, config } = mountData;
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!apiClient) {
      setStatus('error');
      setStatusMessage('No API base URL configured (set options.apiBaseUrl on the wrapper) — API calls are disabled.');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    fetchCategoryDefinition(apiClient, config.primaryCategory, context.channel, config.objectType)
      .then((res: CategoryDefinitionResult) => {
        if (cancelled) return;
        setStatus('loaded');
        setStatusMessage(`Loaded category definition for "${res.objectCategoryDefinition.name}".`);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setStatusMessage(err instanceof Error ? err.message : 'Failed to load category definition.');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient]);

  const levels = Object.entries(config.hierarchy ?? {});

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
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          background: theme?.toolbar ?? '#f5f5f7',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: theme?.primary ?? '#2980b9' }}>
          Course Editor{context.identifier ? ` — ${context.identifier}` : ' — New Course'}
        </div>
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
          primaryCategory: {config.primaryCategory} · objectType: {config.objectType} · maxDepth: {config.maxDepth}
          {readOnly ? ' · read-only' : ''}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, opacity: 0.75 }}>Hierarchy preset</div>
        {levels.length === 0 && <div style={{ fontSize: 13, opacity: 0.6 }}>No hierarchy levels configured.</div>}
        {levels.map(([levelKey, level]) => (
          <div
            key={levelKey}
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: 6,
              padding: '10px 14px',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {levelKey}: {level.name}
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>contentType: {level.contentType}</div>
            {level.children && Object.keys(level.children).length > 0 && (
              <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                children:{' '}
                {Object.entries(level.children)
                  .map(([kind, types]) => `${kind} [${types.join(', ')}]`)
                  .join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer
        style={{
          padding: '8px 20px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          fontSize: 12,
          color: status === 'error' ? '#c0392b' : '#2c7a4b',
          background: '#fafafa',
        }}
      >
        {status === 'idle' && 'Idle.'}
        {status === 'loading' && 'Loading category definition…'}
        {(status === 'loaded' || status === 'error') && statusMessage}
      </footer>
    </div>
  );
}
