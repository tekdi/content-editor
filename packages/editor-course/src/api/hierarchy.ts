import type { ApiClient } from './client';
import { URLS } from './urls';
import type { CourseEditorSavePayload } from '../types';

/** Port of `EditorService.fetchCollectionHierarchy()`. */
export interface HierarchyReadResult {
  content: {
    identifier: string;
    name: string;
    primaryCategory?: string;
    objectType?: string;
    children?: unknown[];
    [key: string]: unknown;
  };
}

export function fetchHierarchy(client: ApiClient, collectionId: string): Promise<HierarchyReadResult> {
  return client.get<HierarchyReadResult>(URLS.hierarchyRead(collectionId), { mode: 'edit' });
}

/** Port of `EditorService.updateHierarchy()` — PATCHes the serialized tree. */
export function updateHierarchy(
  client: ApiClient,
  payload: CourseEditorSavePayload,
  lastUpdatedBy: string
): Promise<{ identifiers?: Record<string, string> }> {
  return client.patch(URLS.hierarchyUpdate, {
    request: { data: { ...payload, lastUpdatedBy } },
  });
}
