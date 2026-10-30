import React from 'react';
import type { ShellManageConfig } from '../types';
import { ShellCreateView } from '../views/ShellCreateView';
import { BaseReactElement } from './BaseReactElement';

/** `<shell-create>` — renders the Shell create form from its category definition. */
export class ShellCreateElement extends BaseReactElement {
  protected renderView(config: ShellManageConfig) {
    return React.createElement(ShellCreateView, { config, emit: this.emit });
  }
}
