import { isEditorWrapperConfig, type EditorWrapperConfig, type EditorPluginInterface } from '@editor/editor-core';
import { editorSelector } from './editorSelector';

export class EditorWrapperElement extends HTMLElement {
  private shadowRoot_!: ShadowRoot;
  private mountPoint!: HTMLDivElement;
  private plugin: EditorPluginInterface | null = null;
  private _editorConfig: EditorWrapperConfig | null = null;

  connectedCallback(): void {
    this.shadowRoot_ = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; width: 100%; height: 100%; }
      * { box-sizing: border-box; }
    `;
    this.shadowRoot_.appendChild(style);

    this.mountPoint = document.createElement('div');
    this.mountPoint.style.cssText = 'width:100%;height:100%;';
    this.shadowRoot_.appendChild(this.mountPoint);

    if (this._editorConfig) this.mountPlugin(this._editorConfig);
  }

  disconnectedCallback(): void {
    this.plugin?.unmount();
    this.plugin = null;
  }

  set editorConfig(val: unknown) {
    if (!isEditorWrapperConfig(val)) {
      console.warn('[EditorWrapper] Invalid editorConfig — expected { editorType, ... }');
      return;
    }
    this._editorConfig = val;
    if (this.mountPoint) this.mountPlugin(val);
  }

  get editorConfig(): EditorWrapperConfig | null {
    return this._editorConfig;
  }

  /** Convenience accessor mirroring the plugin's own getData(). */
  getData(): unknown {
    return this.plugin?.getData();
  }

  private mountPlugin(config: EditorWrapperConfig): void {
    this.plugin?.unmount();

    const plugin = editorSelector(config.editorType);
    if (!plugin) {
      this.dispatch('editor:error', { message: `Unsupported editorType: ${config.editorType}` });
      return;
    }

    this.plugin = plugin;
    this.mountPoint.innerHTML = '';
    plugin.mount(this.mountPoint, {
      data: config.data,
      options: config.options,
      theme: config.theme,
      readOnly: config.readOnly,
      emit: (event, payload) => this.dispatch(event, payload),
    });
  }

  private dispatch(eventName: string, detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true, // crosses the shadow DOM boundary
      })
    );
  }
}
