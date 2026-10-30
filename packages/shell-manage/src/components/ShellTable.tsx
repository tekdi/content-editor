import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { ShellRecord, ShellUsage } from '../types';
import { formatDate } from './format';

export const PAGE_SIZE_OPTIONS = [5, 10, 15];

export interface ShellTableProps {
  rows: ShellRecord[];
  count: number;
  page: number;
  pageSize: number;
  loading: boolean;
  highlightId?: string | null;
  usage: Record<string, ShellUsage>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (shell: ShellRecord) => void;
  onShowCourses: (shell: ShellRecord) => void;
}

/** Number of Live and Draft courses on the shell; clickable when there are any. */
function CourseCount({
  row,
  usage,
  onShowCourses,
}: {
  row: ShellRecord;
  usage?: ShellUsage;
  onShowCourses: (shell: ShellRecord) => void;
}) {
  if (!usage || usage.status === 'queued' || usage.status === 'checking') return <>…</>;
  if (usage.status === 'error') return <>—</>;
  if (usage.status === 'unused') {
    return (
      <Typography variant="body2" color="text.secondary">
        0
      </Typography>
    );
  }
  return (
    <Button
      size="small"
      variant="text"
      color="secondary"
      aria-label={`Show ${usage.count} courses using ${row.name}`}
      onClick={(e) => {
        e.stopPropagation();
        onShowCourses(row);
      }}
      sx={{ minWidth: 0, px: 1, fontWeight: 600 }}
    >
      {usage.count}
    </Button>
  );
}

function RowAction({
  row,
  usage,
  onEdit,
}: {
  row: ShellRecord;
  usage?: ShellUsage;
  onEdit: (shell: ShellRecord) => void;
}) {
  if (!usage || usage.status === 'queued' || usage.status === 'checking') {
    return <CircularProgress size={18} aria-label="Checking whether this shell is in use" />;
  }
  if (usage.status === 'used') {
    return (
      <Tooltip title={`Used by ${usage.count} course${usage.count === 1 ? '' : 's'} — can't be edited`}>
        <LockOutlinedIcon fontSize="small" color="disabled" />
      </Tooltip>
    );
  }
  if (usage.status === 'error') {
    return (
      <Tooltip title={`Couldn't check course usage: ${usage.message}`}>
        <ErrorOutlineIcon fontSize="small" color="warning" />
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Edit shell">
      <IconButton
        size="small"
        aria-label={`Edit ${row.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(row);
        }}
      >
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export function ShellTable({
  rows,
  count,
  page,
  pageSize,
  loading,
  highlightId,
  usage,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onShowCourses,
}: ShellTableProps) {
  return (
    <Paper variant="outlined" sx={{ position: 'relative', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 56 }} align="center">
                Actions
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Keywords</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Courses
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last updated</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const editable = usage[row.identifier]?.status === 'unused';
              return (
                <TableRow
                  key={row.identifier}
                  hover
                  onClick={editable ? () => onEdit(row) : undefined}
                  sx={{
                    cursor: editable ? 'pointer' : 'default',
                    transition: 'background-color 1s',
                    ...(row.identifier === highlightId ? { backgroundColor: '#e8f5e9' } : {}),
                  }}
                >
                  <TableCell align="center">
                    <RowAction row={row} usage={usage[row.identifier]} onEdit={onEdit} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.identifier}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={row.description}>
                      {row.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    {row.keywords?.length ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {row.keywords.map((k) => (
                          <Chip key={k} label={k} size="small" />
                        ))}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <CourseCount row={row} usage={usage[row.identifier]} onShowCourses={onShowCourses} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }} title={formatDate(row.lastUpdatedOn)}>
                    {formatDate(row.lastUpdatedOn, { withTime: false })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status ?? '—'}
                      size="small"
                      color={row.status === 'Live' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No shells found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
        onPageChange={(_, next) => onPageChange(next)}
        onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
      />

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.6)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}
    </Paper>
  );
}
