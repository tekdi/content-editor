import { registerEditorWrapper } from '@editor/editor-webcomponent';
import type { EditorWrapperConfig } from '@editor/editor-webcomponent';
import { registerShellComponents } from '@editor/shell-manage';
import { SHELL_EVENTS } from '@editor/shell-manage';
import type { ShellManageConfig } from '@editor/shell-manage';

registerEditorWrapper();
registerShellComponents();

const defaultConfig: EditorWrapperConfig = {
  editorType: 'content',
  data: {
    title: 'Untitled',
    html: '<p>Start typing…</p>',
  },
  options: {
    placeholder: 'Give it a title',
    base_url: 'https://dev-lap.prathamdigital.org',
    brandLogo: 'https://dev-lap.prathamdigital.org/logo.png',
    primaryCategories: [
      {
        name: 'Learning Resource',
        value: 'Learning Resource',
        MUIicon: 'DescriptionOutlined',
        Description: 'PDFs, videos, audio files, documents',
      },
      {
        name: 'Story',
        value: 'Story',
        MUIicon: 'MenuBookOutlined',
        Description: 'Stories, case studies, examples',
      },
      {
        name: 'Interactive',
        value: 'Interactive',
        MUIicon: 'SportsEsportsOutlined',
        Description: 'H5P, HTML ZIP, interactive exercises',
      },
      {
        name: 'Activity',
        value: 'Activity',
        MUIicon: 'EditOutlined',
        Description: 'Worksheets, exercises, hands-on tasks',
      },
    ],
  },
  theme: {
    primary: '#2980b9',
    toolbar: '#f5f5f7',
  },
};

// Course preset per docs/CONFIGURATION.md ("2. Course") from the legacy
// sunbird-collection-editor repo — primaryCategory: "Course", 2-level
// Chapter/Sub-Chapter hierarchy. `options.apiBaseUrl` is left blank here;
// set it to a real (or dev-proxy) Sunbird backend to exercise API calls.
const courseConfig: EditorWrapperConfig = {
  editorType: 'course',
  data: {
    context: {
      env: 'collection_editor',
      sid: 'demo-session-id',
      did: 'demo-device-id',
      uid: 'demo-user-id',
      channel: 'demo-channel',
      pdata: { id: 'local.sunbird.portal', ver: '1.0.0', pid: 'sunbird-portal' },
      contextRollup: {},
      tags: [],
      framework: 'demo-framework',
      user: { id: 'demo-user-id', fullName: 'Demo User' },
    },
    config: {
      mode: 'edit',
      maxDepth: 2,
      objectType: 'Collection',
      primaryCategory: 'Course',
      isRoot: true,
      iconClass: 'fa fa-book',
      children: {},
      hierarchy: {
        level1: {
          name: 'Chapter',
          type: 'unit',
          mimeType: 'application/vnd.ekstep.content-collection',
          contentType: 'Course Unit',
          iconClass: 'fa fa-folder-o',
          children: {},
        },
        level2: {
          name: 'Sub-Chapter',
          type: 'unit',
          mimeType: 'application/vnd.ekstep.content-collection',
          contentType: 'Course Unit',
          iconClass: 'fa fa-folder-o',
          children: {
            Content: ['Explanation Content', 'Learning Resource', 'eTextbook', 'Teacher Resource', 'Course Assessment'],
            QuestionSet: ['Practice Question Set'],
          },
        },
      },
    },
  },
  options: {
    // apiBaseUrl: 'https://dev-lap.prathamdigital.org',
  },
  theme: {
    primary: '#2980b9',
    toolbar: '#f5f5f7',
  },
};

// shell-manage components take a plain ShellManageConfig, not an EditorWrapperConfig.
// The interface gateway allows CORS, so the demo calls it directly (no dev proxy).
// Token and tenant are read from localStorage.token / localStorage.tenantId (set via the sidebar fields).
const shellConfig: ShellManageConfig = 
/*{
  baseurl: 'https://qa-interface.prathamdigital.org/interface/v1/',
  channel: 'scp-channel',
  framework: 'scp-channel',
  createdBy: 'cb47d101-12c0-4119-b98b-50dbe45c6299',
  createdFor: ['scp-channel'],
  targetFWIds: ['scp-framework'],
  lastUpdatedBy: 'cb47d101-12c0-4119-b98b-50dbe45c6299',
  theme: {
    primary: '#2980b9',
    secondary: '#e67e22',
    buttonShape: 'rounded',
  },
};*/
{
  "baseurl": "https://qa-middleware.prathamdigital.org/",
  "channel": "pos-channel",
  "framework": "pos-framework",
  "createdBy": "254f58a3-3638-40e6-9921-7c4035ac7965",
  "createdFor": [
    "pos-channel"
  ],
  "targetFWIds": [
    "pos-framework"
  ],
  "lastUpdatedBy": "254f58a3-3638-40e6-9921-7c4035ac7965",
  "theme": {
    "primary": "#e67e22",
    "secondary": "#2980b9",
    "buttonShape": "rounded"
  }
};

const CONFIGS: Record<string, EditorWrapperConfig | ShellManageConfig> = {
  content: defaultConfig,
  course: courseConfig,
  'shell-manage': shellConfig,
  'shell-create': shellConfig,
};

const editorEl = document.getElementById('editor') as HTMLElement & {
  editorConfig: EditorWrapperConfig;
  getData: () => unknown;
};

type ShellElement = HTMLElement & { config: ShellManageConfig | null };

/** Dropdown values rendered by a standalone shell element instead of <editor-wrapper>. */
const SHELL_ELEMENTS: Record<string, ShellElement> = {
  'shell-manage': document.getElementById('shell-manage') as ShellElement,
  'shell-create': document.getElementById('shell-create') as ShellElement,
};

const tokenSection = document.getElementById('token-section') as HTMLDivElement;
// Mirrors what the host app keeps in localStorage for the shell components.
function bindStorageInput(inputId: string, key: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement;
  input.value = localStorage.getItem(key) ?? '';
  input.addEventListener('change', () => {
    const value = input.value.trim();
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
    logEvent(`>>> localStorage.${key}`, value ? 'set' : 'removed');
  });
}

bindStorageInput('token-input', 'token');
bindStorageInput('tenant-input', 'tenantId');

const eventLog         = document.getElementById('event-log') as HTMLPreElement;
const loadBtn          = document.getElementById('load-btn') as HTMLButtonElement;
const clearBtn         = document.getElementById('clear-btn') as HTMLButtonElement;
const logDataBtn       = document.getElementById('log-data-btn') as HTMLButtonElement;
const configEditor     = document.getElementById('config-editor') as HTMLTextAreaElement;
const editorTypeSelect = document.getElementById('editor-type-select') as HTMLSelectElement;

function logEvent(name: string, detail: unknown): void {
  const ts   = new Date().toLocaleTimeString();
  const line = `[${ts}] ${name}\n${JSON.stringify(detail, null, 2)}\n\n`;
  eventLog.textContent = line + eventLog.textContent;
}

const EVENTS = ['editor:ready', 'editor:change', 'editor:save', 'editor:error', 'editor:close'];

EVENTS.forEach((evt) => {
  editorEl.addEventListener(evt, (e) => {
    logEvent(evt, (e as CustomEvent).detail);
  });
});

Object.entries(SHELL_ELEMENTS).forEach(([tag, el]) => {
  SHELL_EVENTS.forEach((evt) => {
    el.addEventListener(evt, (e) => {
      logEvent(`${tag} → ${evt}`, (e as CustomEvent).detail);
    });
  });
});

function isShellType(type: string): boolean {
  return type in SHELL_ELEMENTS;
}

/** Shows the element for `type` and hands it the config. */
function applyConfig(type: string, cfg: EditorWrapperConfig | ShellManageConfig): void {
  editorEl.hidden = isShellType(type);
  tokenSection.hidden = !isShellType(type);
  for (const [tag, el] of Object.entries(SHELL_ELEMENTS)) {
    el.hidden = tag !== type;
  }
  if (isShellType(type)) {
    SHELL_ELEMENTS[type].config = cfg as ShellManageConfig;
  } else {
    editorEl.editorConfig = cfg as EditorWrapperConfig;
  }
}

loadBtn.addEventListener('click', () => {
  const type = editorTypeSelect.value;
  try {
    const cfg = JSON.parse(configEditor.value) as EditorWrapperConfig | ShellManageConfig;
    applyConfig(type, cfg);
    logEvent('>>> config applied', { type });
  } catch {
    alert('Invalid JSON in config editor');
  }
});

clearBtn.addEventListener('click', () => {
  eventLog.textContent = '';
});

logDataBtn.addEventListener('click', () => {
  if (isShellType(editorTypeSelect.value)) {
    logEvent('>>> current config', SHELL_ELEMENTS[editorTypeSelect.value].config);
    return;
  }
  logEvent('>>> current data', editorEl.getData());
});

editorTypeSelect.addEventListener('change', () => {
  const cfg = CONFIGS[editorTypeSelect.value];
  if (!cfg) return;
  configEditor.value = JSON.stringify(cfg, null, 2);
  applyConfig(editorTypeSelect.value, cfg);
  logEvent('>>> editor type switched', { type: editorTypeSelect.value });
});

// Pre-fill editor and auto-load on startup
configEditor.value = JSON.stringify(defaultConfig, null, 2);
editorEl.editorConfig = defaultConfig;
