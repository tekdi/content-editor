import { useState, type FormEvent } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { FormErrors, FormSection, FormValues } from '../types';
import { emptyValue, getFieldRenderer } from './fieldRegistry';
import { validateField, validateForm, visibleFields } from './validate';

export interface DynamicFormProps {
  sections: FormSection[];
  initialValues?: FormValues;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
}

function buildInitialValues(sections: FormSection[], initial?: FormValues): FormValues {
  const values: FormValues = {};
  for (const field of visibleFields(sections)) {
    values[field.code] = initial?.[field.code] ?? emptyValue(field);
  }
  return values;
}

/** Renders a category-definition form config (`forms.<name>.properties`). */
export function DynamicForm({ sections, initialValues, submitLabel = 'Submit', submitting, onSubmit, onCancel }: DynamicFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(sections, initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(sections, values);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(visibleFields(sections).map((f) => [f.code, true])));
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {sections.map((section, sectionIndex) => (
          <Stack key={section.name ?? sectionIndex} spacing={2.5}>
            {section.name && (
              <Typography variant="subtitle1" fontWeight={600}>
                {section.name}
              </Typography>
            )}
            {section.fields
              .filter((field) => field.visible !== false)
              .map((field) => {
                const Renderer = getFieldRenderer(field.inputType);
                return (
                  <Renderer
                    key={field.code}
                    field={field}
                    value={values[field.code]}
                    error={touched[field.code] ? errors[field.code] : undefined}
                    disabled={field.editable === false || !!submitting}
                    onChange={(value) => {
                      setValues((prev) => ({ ...prev, [field.code]: value }));
                      if (touched[field.code]) {
                        setErrors((prev) => ({ ...prev, [field.code]: validateField(field, value) }));
                      }
                    }}
                    onBlur={(blurValue) => {
                      const current = blurValue !== undefined ? blurValue : values[field.code];
                      setTouched((prev) => ({ ...prev, [field.code]: true }));
                      setErrors((prev) => ({ ...prev, [field.code]: validateField(field, current) }));
                    }}
                  />
                );
              })}
          </Stack>
        ))}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
