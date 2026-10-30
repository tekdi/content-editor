import { useState, type ReactElement } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import type { FormField } from '../types';

export interface FieldRendererProps {
  field: FormField;
  value: unknown;
  error?: string;
  disabled: boolean;
  onChange: (value: unknown) => void;
  /** Pass the field's final value when blur itself changed it (e.g. committed pending text). */
  onBlur: (value?: unknown) => void;
}

type FieldRenderer = (props: FieldRendererProps) => ReactElement;

const TextInput: FieldRenderer = ({ field, value, error, disabled, onChange, onBlur }) => (
  <TextField
    fullWidth
    label={field.label ?? field.name}
    placeholder={field.placeholder}
    required={field.required}
    disabled={disabled}
    value={(value as string) ?? ''}
    error={!!error}
    helperText={error ?? field.description}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const TextAreaInput: FieldRenderer = ({ field, value, error, disabled, onChange, onBlur }) => (
  <TextField
    fullWidth
    multiline
    minRows={3}
    label={field.label ?? field.name}
    placeholder={field.placeholder}
    required={field.required}
    disabled={disabled}
    value={(value as string) ?? ''}
    error={!!error}
    helperText={error ?? field.description}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
  />
);

const KEYWORDS_PLACEHOLDER = 'Type a keyword and press Enter or comma';

/** Appends trimmed, non-empty keywords that aren't already present. */
function addKeywords(existing: string[], incoming: string[]): string[] {
  const next = [...existing];
  for (const raw of incoming) {
    const keyword = raw.trim();
    if (keyword && !next.includes(keyword)) next.push(keyword);
  }
  return next;
}

/**
 * Free-text chips. A keyword is added on Enter, on comma (pasting `a, b, c` adds three),
 * and on blur — so text still in the box when the user clicks Save isn't lost.
 */
function KeywordsInput({ field, value, error, disabled, onChange, onBlur }: FieldRendererProps) {
  const [input, setInput] = useState('');
  const keywords = (value as string[]) ?? [];

  return (
    <Autocomplete<string, true, false, true>
      multiple
      freeSolo
      options={[]}
      disabled={disabled}
      value={keywords}
      inputValue={input}
      onInputChange={(_, text, reason) => {
        if (reason === 'input' && text.includes(',')) {
          const parts = text.split(',');
          // Everything before the last comma becomes chips; the rest stays in the box.
          setInput(parts.pop() ?? '');
          onChange(addKeywords(keywords, parts));
          return;
        }
        setInput(text);
      }}
      onChange={(_, next) => onChange(addKeywords([], next))}
      onBlur={() => {
        const next = addKeywords(keywords, [input]);
        if (input) {
          setInput('');
          if (next.length !== keywords.length) onChange(next);
        }
        onBlur(next);
      }}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} label={tag} size="small" {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={field.label ?? field.name}
          // The form config's placeholder only mentions Enter; this input also accepts commas.
          placeholder={keywords.length ? 'Add another keyword' : KEYWORDS_PLACEHOLDER}
          required={field.required}
          error={!!error}
          helperText={error ?? field.description}
        />
      )}
    />
  );
}

/** inputType → renderer. Add new form-config input types here. */
const registry: Record<string, FieldRenderer> = {
  text: TextInput,
  textarea: TextAreaInput,
  keywords: KeywordsInput,
};

export function getFieldRenderer(inputType: string): FieldRenderer {
  const renderer = registry[inputType];
  if (!renderer) {
    console.warn(`[shell-manage] Unsupported inputType "${inputType}", rendering as text.`);
    return TextInput;
  }
  return renderer;
}

/** Initial value for a field: its `default`, else an empty value matching its shape. */
export function emptyValue(field: FormField): unknown {
  if (field.default !== undefined) return field.default;
  return field.inputType === 'keywords' || field.dataType === 'list' ? [] : '';
}
