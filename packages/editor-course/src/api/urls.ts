/**
 * Ported subset of the legacy library's `url.config.json`, scoped to what
 * Phase 1 (Course preset, `objectType: 'Collection'`) needs. Hardcodes the
 * `content/v3/*` (Collection) branch rather than reintroducing the legacy
 * `objectType -> url-set` indirection, since Course never resolves to the
 * `questionset/v1/*` branch (that only applies to standalone QuestionSet
 * editing, out of MVP scope).
 */
export const URLS = {
  hierarchyRead: (id: string) => `content/v3/hierarchy/${id}`,
  hierarchyUpdate: 'content/v3/hierarchy/update',
  categoryDefinition: 'object/category/definition/v1/read?fields=objectMetadata,forms,name,label',
  frameworkRead: (id: string) => `framework/v1/read/${id}`,
  channelRead: (id: string) => `channel/v1/read/${id}`,
  compositeSearch: 'composite/v3/search',
  contentReview: (id: string) => `content/v3/review/${id}`,
  contentReject: (id: string) => `content/v3/reject/${id}`,
  contentPublish: (id: string) => `content/v3/publish/${id}`,
} as const;
