import type {
  CourseSearchResult,
  FormValues,
  ShellManageConfig,
  ShellRecord,
  ShellSearchParams,
  ShellSearchResult,
} from '../types';
import { generateId, postJson, requestJson } from './http';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const SEARCH_PATH = 'action/composite/v3/search';
const CREATE_PATH = 'action/content/v3/create';
const UPDATE_PATH = 'action/collection/v1/system/update';

interface WriteResult {
  identifier: string;
  node_id?: string;
  versionKey: string;
}

/** Filters shared by every shell search; `framework` matches what createShell sends. */
function baseFilters(config: ShellManageConfig) {
  return {
    status: ['Live'],
    primaryCategory: ['Shell'],
    channel: config.channel,
    ...(config.framework ? { framework: config.framework } : {}),
  };
}

/** Drops empty strings / arrays so optional fields aren't sent blank on create. */
function compact(values: FormValues): FormValues {
  return Object.fromEntries(
    Object.entries(values).filter(([, v]) => !(v === '' || v == null || (Array.isArray(v) && v.length === 0)))
  );
}

/**
 * One page of Live shells, newest first, paged on the server with the exact page size.
 * Editing a shell can also index a `.img` copy under the same identifier; counting both
 * would give short pages and inflated totals, so only the Live copies are searched
 * (`IL_FUNC_OBJECT_TYPE: Collection`). The collection system update keeps the Live copy current.
 */
export async function searchShells(config: ShellManageConfig, params: ShellSearchParams): Promise<ShellSearchResult> {
  const query = params.query?.trim();
  const result = await postJson<{ count?: number; content?: ShellRecord[] }>(config, SEARCH_PATH, {
    request: {
      filters: { ...baseFilters(config), IL_FUNC_OBJECT_TYPE: ['Collection'] },
      // `query` is a request-level field — inside `filters` it matches nothing.
      ...(query ? { query } : {}),
      sort_by: { lastUpdatedOn: 'desc' },
      limit: params.limit,
      offset: params.offset,
    },
  });
  return { count: result.count ?? 0, content: result.content ?? [] };
}

/** Course statuses that count as "using" a shell — for the course count, edit lock and courses popup. */
const COURSE_STATUSES = ['Live', 'Draft'];

/** Live and Draft courses built on a shell (paged). */
export async function searchShellCourses(
  config: ShellManageConfig,
  identifier: string,
  { limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<CourseSearchResult> {
  const result = await postJson<{ count?: number; content?: CourseSearchResult['content'] }>(config, SEARCH_PATH, {
    request: {
      filters: { status: COURSE_STATUSES, shell: identifier, primaryCategory: ['Course'], channel: config.channel },
      sort_by: { lastUpdatedOn: 'desc' },
      limit,
      offset,
    },
  });
  return { count: result.count ?? 0, content: result.content ?? [] };
}

const COUNT_RETRY_DELAY_MS = 1000;

/**
 * Number of Live and Draft courses built on this shell — a shell is editable only while it is 0.
 * Retries once: the search gateway intermittently answers 502 under bursts of calls.
 */
export async function countCoursesUsingShell(config: ShellManageConfig, identifier: string): Promise<number> {
  // Only `count` is needed, so ask for a single record.
  const page = { limit: 1, offset: 0 };
  try {
    return (await searchShellCourses(config, identifier, page)).count;
  } catch {
    await sleep(COUNT_RETRY_DELAY_MS);
    return (await searchShellCourses(config, identifier, page)).count;
  }
}

/** Live record for one shell, looked up the same way as a list page (`searchShells`). */
export async function fetchShellById(config: ShellManageConfig, identifier: string): Promise<ShellRecord | null> {
  const result = await postJson<{ content?: ShellRecord[] }>(config, SEARCH_PATH, {
    request: {
      filters: { ...baseFilters(config), identifier, IL_FUNC_OBJECT_TYPE: ['Collection'] },
      limit: 1,
      offset: 0,
    },
  });
  return result.content?.[0] ?? null;
}

/**
 * Search is indexed asynchronously, so right after a create/update it still
 * returns the old record (or none). Poll until `isIndexed` accepts the record
 * (e.g. its versionKey or changed values match); resolves null if it doesn't
 * show up within the attempts.
 */
export async function waitForIndexedShell(
  config: ShellManageConfig,
  identifier: string,
  isIndexed: (record: ShellRecord) => boolean,
  { attempts = 8, delayMs = 1000 } = {}
): Promise<ShellRecord | null> {
  for (let i = 0; i < attempts; i++) {
    await sleep(delayMs);
    try {
      const record = await fetchShellById(config, identifier);
      if (record && isIndexed(record)) return record;
    } catch {
      // transient search failure — keep polling
    }
  }
  return null;
}

export function createShell(config: ShellManageConfig, values: FormValues): Promise<WriteResult> {
  return postJson<WriteResult>(config, CREATE_PATH, {
    request: {
      content: {
        ...compact(values),
        code: generateId(),
        createdBy: config.createdBy,
        createdFor: config.createdFor,
        mimeType: 'application/vnd.ekstep.content-collection',
        primaryCategory: 'Shell',
        channel: config.channel,
        framework: config.framework,
        targetFWIds: config.targetFWIds,
        contentType: 'Collection',
        resourceType: 'Collection',
        status: 'Live',
      },
    },
  });
}

/** Collection system update: send only the changed fields (no versionKey needed). */
export function updateShell(
  config: ShellManageConfig,
  identifier: string,
  values: FormValues
): Promise<Partial<WriteResult>> {
  return requestJson<Partial<WriteResult>>(config, 'PATCH', `${UPDATE_PATH}/${encodeURIComponent(identifier)}`, {
    request: { collection: { ...values, lastUpdatedBy: config.lastUpdatedBy } },
  });
}
