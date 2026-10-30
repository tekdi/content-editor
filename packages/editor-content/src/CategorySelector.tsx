import React, { useState } from 'react';
import * as MuiIcons from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { EditorThemeConfig } from '@editor/editor-core';
import type { ContentEditorPrimaryCategory } from './types';

export interface CategorySelectorProps {
  categories: ContentEditorPrimaryCategory[];
  theme?: EditorThemeConfig;
  readOnly?: boolean;
  onContinue: (category: ContentEditorPrimaryCategory) => void;
}

type MuiIconComponent = React.ComponentType<{ style?: React.CSSProperties }>;

// Inline styles can't respond to media queries, so the responsive 12-column
// layout (2-up on tablet/laptop/desktop, 1-up on mobile) lives in a plain
// scoped <style> tag rather than the style={} objects used elsewhere here.
const RESPONSIVE_STYLES = `
  .ce-category-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
    max-width: 760px;
  }
  .ce-category-card {
    grid-column: span 6;
  }
  @media (max-width: 599px) {
    .ce-category-card {
      grid-column: span 12;
    }
  }
`;

function resolveIcon(name: string): MuiIconComponent {
  const icons = MuiIcons as unknown as Record<string, MuiIconComponent>;
  const Icon = icons[name];
  if (!Icon) {
    console.warn(`[ContentEditor] Unknown MUIicon "${name}" — falling back to HelpOutline`);
    return HelpOutlineIcon;
  }
  return Icon;
}

export function CategorySelector({ categories, theme, readOnly, onContinue }: CategorySelectorProps): React.JSX.Element {
  const [selected, setSelected] = useState<string | null>(null);
  const primary = theme?.primary ?? '#2980b9';
  const selectedCategory = categories.find((c) => c.value === selected) ?? null;

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
      <style>{RESPONSIVE_STYLES}</style>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#5a6472' }}>
        Choose the type of content you want to create.
      </p>

      <div className="ce-category-grid">
        {categories.map((category) => {
          const Icon = resolveIcon(category.MUIicon);
          const isSelected = category.value === selected;
          return (
            <button
              key={category.value}
              type="button"
              disabled={readOnly}
              onClick={() => setSelected(category.value)}
              className="ce-category-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 12,
                textAlign: 'left',
                padding: 20,
                borderRadius: 8,
                border: isSelected ? `1.5px solid ${primary}` : '1px solid #e2e5ea',
                background: '#ffffff',
                cursor: readOnly ? 'default' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: '#eaf2f8',
                }}
              >
                <Icon style={{ color: primary, fontSize: 24 }} />
              </span>
              <strong style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{category.name}</strong>
              <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.4 }}>{category.Description}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, maxWidth: 760 }}>
        <button
          type="button"
          disabled={!selectedCategory || readOnly}
          onClick={() => selectedCategory && onContinue(selectedCategory)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            color: '#ffffff',
            background: selectedCategory ? primary : '#a9c3d6',
            cursor: selectedCategory && !readOnly ? 'pointer' : 'default',
          }}
        >
          Continue
          <ArrowForwardIcon style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
