import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { createShell, updateShell } from '../api/shells';
import { DynamicForm } from '../form/DynamicForm';
import type { EmitFn, FormSection, FormValues, ShellManageConfig, ShellRecord } from '../types';

export interface ShellFormProps {
  config: ShellManageConfig;
  sections: FormSection[];
  emit: EmitFn;
  /** Present → edit mode (form prefilled from it), absent → create mode. */
  shell?: ShellRecord;
  onCreated?: (identifier: string, versionKey: string) => void;
  /**
   * Receives the record with the saved changes applied locally (search isn't re-indexed yet)
   * and a check that tells when an indexed record already includes this update.
   */
  onUpdated?: (identifier: string, shell: ShellRecord, isIndexed: (record: ShellRecord) => boolean) => void;
  onCancel?: () => void;
}

const REQUIRED_CONFIG = {
  create: ['createdBy', 'framework', 'createdFor', 'targetFWIds'],
  update: ['lastUpdatedBy'],
} as const;

function isBlank(value: unknown): boolean {
  return value == null || value === '' || (Array.isArray(value) && value.length === 0);
}

function missingConfig(config: ShellManageConfig, mode: keyof typeof REQUIRED_CONFIG): string[] {
  return REQUIRED_CONFIG[mode].filter((key) => {
    const value = config[key];
    return isBlank(value);
  });
}

function prefillValues(sections: FormSection[], shell: ShellRecord): FormValues {
  const values: FormValues = {};
  for (const field of sections.flatMap((s) => s.fields)) {
    if (shell[field.code] !== undefined) values[field.code] = shell[field.code];
  }
  return values;
}

/** Fields whose value differs from the record — blank and missing count as equal. */
function changedValues(values: FormValues, shell: ShellRecord): FormValues {
  return Object.fromEntries(
    Object.entries(values).filter(([code, value]) => {
      const before = shell[code];
      if (isBlank(value) && isBlank(before)) return false;
      return JSON.stringify(value) !== JSON.stringify(before);
    })
  );
}

/** Create/edit form for a shell: renders the definition's form and calls the create/update API. */
export function ShellForm({ config, sections, emit, shell, onCreated, onUpdated, onCancel }: ShellFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!shell;

  const handleSubmit = async (values: FormValues) => {
    emit('shell:submit', { values, identifier: shell?.identifier });
    setError(null);

    const mode = isEdit ? 'update' : 'create';
    const missing = missingConfig(config, mode);
    if (missing.length) {
      const message = `Missing config for ${mode}: ${missing.join(', ')}`;
      setError(message);
      emit('shell:error', { message });
      return;
    }

    setSubmitting(true);
    try {
      if (shell) {
        // Send only what the user changed so untouched fields aren't overwritten with blanks.
        const changes = changedValues(values, shell);
        const result = await updateShell(config, shell.identifier, changes);
        const identifier = result.identifier ?? shell.identifier;
        const updated: ShellRecord = {
          ...shell,
          ...changes,
          versionKey: result.versionKey ?? shell.versionKey,
          lastUpdatedOn: new Date().toISOString(),
        };
        // Prefer the versionKey from the response; otherwise wait until the changed values are indexed.
        const isIndexed = result.versionKey
          ? (record: ShellRecord) => record.versionKey === result.versionKey
          : (record: ShellRecord) =>
              Object.entries(changes).every(([code, v]) => JSON.stringify(record[code] ?? '') === JSON.stringify(v ?? ''));
        emit('shell:updated', { identifier, versionKey: updated.versionKey, shell: updated });
        onUpdated?.(identifier, updated, isIndexed);
      } else {
        const result = await createShell(config, values);
        emit('shell:created', { identifier: result.identifier, versionKey: result.versionKey, values });
        onCreated?.(result.identifier, result.versionKey);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save shell';
      setError(message);
      emit('shell:error', { message, cause: err });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <DynamicForm
        sections={sections}
        initialValues={shell ? prefillValues(sections, shell) : undefined}
        submitLabel={isEdit ? 'Save' : 'Create'}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Stack>
  );
}
