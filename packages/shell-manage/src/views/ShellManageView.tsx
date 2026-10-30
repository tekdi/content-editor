import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { countCoursesUsingShell, searchShells, sleep, waitForIndexedShell } from '../api/shells';
import { ShellFilters, EMPTY_FILTERS, type ShellFilterValues } from '../components/ShellFilters';
import { ShellCoursesDialog } from '../components/ShellCoursesDialog';
import { ShellForm } from '../components/ShellForm';
import { PAGE_SIZE_OPTIONS, ShellTable } from '../components/ShellTable';
import { useCategoryDefinition } from '../hooks/useCategoryDefinition';
import type { EmitFn, ShellManageConfig, ShellRecord, ShellUsage } from '../types';

/** Pause between the per-row course checks — firing them all at once makes the search gateway return 502s. */
const USAGE_CHECK_GAP_MS = 300;

export interface ShellManageViewProps {
  config: ShellManageConfig;
  emit: EmitFn;
}

/** 'create' → new shell, record → editing that shell. Kept after close so the exit fade keeps its content. */
type DialogTarget = 'create' | ShellRecord;

export function ShellManageView({ config, emit }: ShellManageViewProps) {
  const { state: definitionState, retry: retryDefinition } = useCategoryDefinition(config, emit);

  const [filters, setFilters] = useState<ShellFilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [rows, setRows] = useState<ShellRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [usage, setUsage] = useState<Record<string, ShellUsage>>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>('create');
  const [toast, setToast] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [coursesShell, setCoursesShell] = useState<ShellRecord | null>(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // One server page per (filter, page, page size): `limit` is exactly the rows per page.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    searchShells(config, { query: filters.query, limit: pageSize, offset: page * pageSize })
      .then((result) => {
        if (cancelled) return;
        setRows(result.content);
        setCount(result.count);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load shells';
        setListError(message);
        emit('shell:error', { message, cause: err });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.baseurl, config.channel, config.framework, filters, page, pageSize, reloadKey]);

  // A reload (e.g. after create) re-checks course usage for every shell.
  useEffect(() => {
    setUsage({});
  }, [reloadKey, config.baseurl, config.channel, config.framework]);

  const rowIds = rows.map((r) => r.identifier).join(',');

  // Keep the page in range when the total shrinks.
  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(count / pageSize) - 1);
    if (!loading && page > lastPage) setPage(lastPage);
  }, [count, page, pageSize, loading]);

  useEffect(() => {
    if (loading) return;
    emit('shell:list-loaded', { count, offset: page * pageSize, limit: pageSize, query: filters.query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, count, page, pageSize, filters.query]);

  // A shell may only be edited while no Live or Draft course uses it — check the visible rows not checked yet,
  // one at a time with a short gap so the search gateway isn't flooded.
  useEffect(() => {
    if (loading) return;
    const pending = rows.filter((r) => !usage[r.identifier]);
    if (!pending.length) return;
    let cancelled = false;
    setUsage((prev) => ({
      ...prev,
      ...Object.fromEntries(pending.map((r) => [r.identifier, { status: 'queued' } as ShellUsage])),
    }));
    void (async () => {
      for (const [i, row] of pending.entries()) {
        if (cancelled) return;
        if (i > 0) await sleep(USAGE_CHECK_GAP_MS);
        if (cancelled) return;
        setUsage((prev) => ({ ...prev, [row.identifier]: { status: 'checking' } }));
        const u: ShellUsage = await countCoursesUsingShell(config, row.identifier)
          .then((n): ShellUsage => (n === 0 ? { status: 'unused' } : { status: 'used', count: n }))
          .catch((err: unknown): ShellUsage => ({
            status: 'error',
            message: err instanceof Error ? err.message : 'Request failed',
          }));
        if (!cancelled) setUsage((prev) => ({ ...prev, [row.identifier]: u }));
      }
    })();
    return () => {
      cancelled = true;
      // Unfinished checks are dropped so they run again when their rows are next shown.
      setUsage((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([, u]) => u.status !== 'queued' && u.status !== 'checking')
        )
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rowIds]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const handleFiltersChange = useCallback((next: ShellFilterValues) => {
    setFilters(next);
    setPage(0);
  }, []);

  const openCreate = () => {
    setDialogTarget('create');
    setDialogOpen(true);
    emit('shell:create-open', {});
  };

  const openEdit = (shell: ShellRecord) => {
    if (usage[shell.identifier]?.status !== 'unused') return;
    setDialogTarget(shell);
    setDialogOpen(true);
    emit('shell:edit-open', { identifier: shell.identifier });
  };

  const openCourses = (shell: ShellRecord) => {
    setCoursesShell(shell);
    const u = usage[shell.identifier];
    emit('shell:courses-open', { identifier: shell.identifier, count: u?.status === 'used' ? u.count : 0 });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    emit('shell:cancel', {});
  };

  const sections = definitionState.status === 'ready' ? definitionState.definition.forms?.create?.properties : undefined;
  const editing = dialogTarget !== 'create' ? dialogTarget : undefined;

  return (
    // color: inherited CSS (e.g. a dark host page's text color) crosses the shadow boundary.
    <Box sx={{ p: 3, color: 'text.primary' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Back">
            <IconButton aria-label="Back" onClick={() => emit('shell:back', {})} edge="start">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h6">Shell Management</Typography>
            <Typography variant="body2" color="text.secondary">
              {count} {count === 1 ? 'shell' : 'shells'}
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!sections}>
          Add New Shell
        </Button>
      </Stack>

      {definitionState.status === 'error' && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={retryDefinition}>
              Retry
            </Button>
          }
        >
          Shell form could not be loaded, so create and edit are unavailable: {definitionState.message}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 2, alignItems: 'start' }}>
        <ShellFilters value={filters} onChange={handleFiltersChange} />

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {listError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>
                  Retry
                </Button>
              }
            >
              {listError}
            </Alert>
          )}
          <ShellTable
            rows={rows}
            count={count}
            page={page}
            pageSize={pageSize}
            loading={loading}
            highlightId={highlightId}
            usage={usage}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
            onEdit={(shell) => sections && openEdit(shell)}
            onShowCourses={openCourses}
          />
        </Stack>
      </Box>

      {/* No onClose: outside clicks and Esc don't close it — only the close icon / Cancel do. */}
      <Dialog open={dialogOpen && !!sections} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          {editing ? 'Edit Shell' : 'Add New Shell'}
          <IconButton aria-label="Close" onClick={closeDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {sections && (
            <ShellForm
              key={editing?.identifier ?? 'create'}
              config={config}
              sections={sections}
              emit={emit}
              shell={editing}
              onCancel={closeDialog}
              onCreated={async (identifier, versionKey) => {
                setDialogOpen(false);
                setToast('Shell created');
                setLoading(true);
                // Reload once search has indexed the new shell (newest first → page 0).
                await waitForIndexedShell(config, identifier, (record) => record.versionKey === versionKey);
                if (!mounted.current) return;
                setPage(0);
                setReloadKey((k) => k + 1);
                setHighlightId(identifier);
              }}
              onUpdated={async (identifier, updated, isIndexed) => {
                setDialogOpen(false);
                setToast('Shell updated');
                // Replace only the edited row: saved values now, the indexed record once search catches up.
                const replaceRow = (record: ShellRecord) =>
                  setRows((prev) => prev.map((r) => (r.identifier === identifier ? record : r)));
                replaceRow(updated);
                setHighlightId(identifier);
                const indexed = await waitForIndexedShell(config, identifier, isIndexed);
                if (indexed && mounted.current) replaceRow(indexed);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ShellCoursesDialog
        config={config}
        shell={coursesShell}
        pageSize={pageSize}
        onClose={() => setCoursesShell(null)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
