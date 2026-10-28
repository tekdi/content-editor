import type { ReactElement } from 'react';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, type Theme } from '@mui/material/styles';
import type { EmitFn, ShellManageConfig } from '../types';
import { buildShellTheme } from './theme';

/**
 * Shared plumbing for every shell web component: shadow root, Emotion cache
 * scoped to that shadow root, React root, the `config` input (JS property or
 * JSON attribute) and DOM event emission. Subclasses only implement `renderView`.
 */
export abstract class BaseReactElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['config'];
  }

  private root: Root | null = null;
  private emotionCache: EmotionCache | null = null;
  private theme: Theme;
  private themeKey = '';
  private mountPoint: HTMLDivElement;
  private portalPoint: HTMLDivElement;
  private _config: ShellManageConfig | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    // MUI portals (Dialog, Menu, Popover, Tooltip) default to document.body, outside
    // the shadow root and therefore unstyled — keep them inside the shadow tree instead.
    this.portalPoint = document.createElement('div');
    shadow.append(this.mountPoint, this.portalPoint);
    this.theme = buildShellTheme(this.portalContainer);
  }

  private portalContainer = () => this.portalPoint;

  /** Rebuilds the MUI theme only when `config.theme` actually changes. */
  private syncTheme(config: ShellManageConfig): void {
    const key = JSON.stringify(config.theme ?? {});
    if (key === this.themeKey) return;
    this.themeKey = key;
    try {
      this.theme = buildShellTheme(this.portalContainer, config.theme);
    } catch (err) {
      this.theme = buildShellTheme(this.portalContainer);
      this.emit('shell:error', { message: 'Invalid "theme" in config — using default theme', cause: err });
    }
  }

  get config(): ShellManageConfig | null {
    return this._config;
  }

  set config(value: ShellManageConfig | null) {
    this._config = value;
    this.render();
  }

  attributeChangedCallback(name: string, _old: string | null, next: string | null): void {
    if (name !== 'config' || next === null) return;
    try {
      this.config = JSON.parse(next) as ShellManageConfig;
    } catch (err) {
      this.emit('shell:error', { message: 'Invalid JSON in "config" attribute', cause: err });
    }
  }

  connectedCallback(): void {
    // MUI/Emotion injects <style> tags into document.head by default, which never
    // reaches a shadow tree — scope the cache to this element's shadow root.
    this.emotionCache ??= createCache({ key: 'sm', container: this.shadowRoot! });
    this.root ??= createRoot(this.mountPoint);
    this.render();
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = null;
  }

  protected emit: EmitFn = (event, detail) => {
    this.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }));
  };

  protected abstract renderView(config: ShellManageConfig): ReactElement;

  private render(): void {
    if (!this.root || !this.emotionCache || !this._config) return;
    this.syncTheme(this._config);
    this.root.render(
      React.createElement(
        CacheProvider,
        { value: this.emotionCache },
        React.createElement(ThemeProvider, { theme: this.theme }, this.renderView(this._config))
      )
    );
  }
}
