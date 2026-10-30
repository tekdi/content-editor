import type { FormErrors, FormField, FormSection, FormValues } from '../types';

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Returns the first failing validation message for a field, or undefined. */
export function validateField(field: FormField, value: unknown): string | undefined {
  const rules = field.validations ?? [];
  const requiredRule = rules.find((r) => r.type === 'required');

  if ((field.required || requiredRule) && isEmpty(value)) {
    return requiredRule?.message ?? `${field.label ?? field.code} is required`;
  }

  for (const rule of rules) {
    if (rule.type === 'maxLength') {
      const max = Number(rule.value);
      const length = typeof value === 'string' || Array.isArray(value) ? value.length : 0;
      if (Number.isFinite(max) && length > max) {
        return rule.message ?? `Maximum ${max} characters allowed`;
      }
    }
  }
  return undefined;
}

export function visibleFields(sections: FormSection[]): FormField[] {
  return sections.flatMap((s) => s.fields).filter((f) => f.visible !== false);
}

export function validateForm(sections: FormSection[], values: FormValues): FormErrors {
  const errors: FormErrors = {};
  for (const field of visibleFields(sections)) {
    const error = validateField(field, values[field.code]);
    if (error) errors[field.code] = error;
  }
  return errors;
}
