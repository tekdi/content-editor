export interface ContentEditorData {
  title?: string;
  html: string;
  /** Value of the selected `primaryCategories` entry. Unset until the category step is completed. */
  category?: string;
  /** Files/YouTube links added on the upload step. Unset/empty until the first item is added. */
  items?: ContentEditorUploadItem[];
}

export type ContentEditorUploadStatus = 'uploaded' | 'failed';

export interface ContentEditorUploadItem {
  id: string;
  kind: 'file' | 'youtube';
  name: string;
  sizeLabel?: string;
  status: ContentEditorUploadStatus;
  statusMessage?: string;
  contentType?: string;
  /** 0-100. Placeholder for metadata-completeness — not yet wired to a real metadata form. */
  metadataProgress: number;
  url?: string;
}

export type ContentEditorToolbarItem =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'bulletList'
  | 'orderedList'
  | 'link';

/** One selectable card on the "choose content type" screen. `MUIicon` is an export name from `@mui/icons-material`. */
export interface ContentEditorPrimaryCategory {
  name: string;
  value: string;
  MUIicon: string;
  Description: string;
}

export interface ContentEditorOptions {
  placeholder?: string;
  showTitle?: boolean;
  toolbar?: ContentEditorToolbarItem[];
  base_url?: string;
  brandLogo?: string;
  /** When provided, the editor opens on a category-picker step, followed by an upload step, before the title/body editor. */
  primaryCategories?: ContentEditorPrimaryCategory[];
  /** File extensions accepted on the upload step (no leading dot), shown to the user and used for client-side validation. */
  supportedFormats?: string[];
  /** Options for the per-row "Content Type" dropdown on the uploaded-files step. */
  contentTypeOptions?: string[];
}
