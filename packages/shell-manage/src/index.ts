import { ShellCreateElement } from './elements/ShellCreateElement';
import { ShellManageElement } from './elements/ShellManageElement';

export { ShellCreateElement } from './elements/ShellCreateElement';
export { ShellManageElement } from './elements/ShellManageElement';
export { SHELL_EVENTS } from './types';
export { BaseReactElement } from './elements/BaseReactElement';
export type {
  ShellManageConfig,
  ShellThemeConfig,
  ShellEvent,
  CategoryDefinition,
  FormDefinition,
  FormSection,
  FormField,
  FieldValidation,
  FormValues,
  ShellRecord,
} from './types';

/** Tag name → element class. */
const SHELL_ELEMENTS: Record<string, CustomElementConstructor> = {
  'shell-manage': ShellManageElement,
  'shell-create': ShellCreateElement,
};

export function registerShellComponents(): void {
  for (const [tag, ctor] of Object.entries(SHELL_ELEMENTS)) {
    if (!customElements.get(tag)) customElements.define(tag, ctor);
  }
}

// Auto-register when loaded as IIFE (plain <script> tag)
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  registerShellComponents();
}
