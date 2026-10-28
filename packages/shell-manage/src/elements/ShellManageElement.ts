import React from 'react';
import type { ShellManageConfig } from '../types';
import { ShellManageView } from '../views/ShellManageView';
import { BaseReactElement } from './BaseReactElement';

/** `<shell-manage>` — shell list with filters and pagination, plus create/edit dialogs. */
export class ShellManageElement extends BaseReactElement {
  protected renderView(config: ShellManageConfig) {
    return React.createElement(ShellManageView, { config, emit: this.emit });
  }
}
