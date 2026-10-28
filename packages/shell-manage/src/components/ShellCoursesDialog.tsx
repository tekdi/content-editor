import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { searchShellCourses } from '../api/shells';
import type { CourseRecord, ShellManageConfig, ShellRecord } from '../types';
import { formatDate } from './format';

export interface ShellCoursesDialogProps {
  config: ShellManageConfig;
  /** The shell whose courses are listed; null keeps the dialog closed. */
  shell: ShellRecord | null;
  /** Courses per page — the shell list's current rows per page; not changeable in the dialog. */
  pageSize: number;
  onClose: () => void;
}

/** Popup listing the Live courses built on a shell. */
export function ShellCoursesDialog({ config, shell, pageSize, onClose }: ShellCoursesDialogProps) {
  const [page, setPage] = useState(0);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Keep the last shell so the title doesn't blank out during the close animation.
  const [lastShell, setLastShell] = useState<ShellRecord | null>(shell);

  useEffect(() => {
    if (shell) {
      setLastShell(shell);
      setPage(0);
    }
  }, [shell]);

  useEffect(() => {
    if (!shell) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchShellCourses(config, shell.identifier, { limit: pageSize, offset: page * pageSize })
      .then((result) => {
        if (cancelled) return;
        setCourses(result.content);
        setCount(result.count);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load courses');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shell, page, pageSize, reloadKey, config.baseurl, config.channel]);

  return (
    // No onClose: outside clicks and Esc don't close it — only the close icon does.
    <Dialog open={!!shell} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 6 }}>
        Courses using this shell
        <Typography variant="body2" color="text.secondary">
          {lastShell?.name}
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, position: 'relative', minHeight: 160 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ m: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!error && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last updated</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.identifier}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar variant="rounded" src={course.appIcon} alt="" sx={{ width: 36, height: 36 }}>
                        <MenuBookOutlinedIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {course.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.identifier}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{course.se_gradeLevels?.join(', ') || '—'}</TableCell>
                  <TableCell>
                    {course.se_subjects?.length ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {course.se_subjects.map((s) => (
                          <Chip key={s} label={s} size="small" />
                        ))}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(course.lastUpdatedOn)}</TableCell>
                  <TableCell>
                    <Chip
                      label={course.status ?? '—'}
                      size="small"
                      color={course.status === 'Live' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!loading && courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No courses use this shell
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

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
      </DialogContent>
      {count > 0 && (
        <TablePagination
          component="div"
          count={count}
          page={page}
          rowsPerPage={pageSize}
          // Page navigation only — no rows-per-page selector.
          rowsPerPageOptions={[]}
          onPageChange={(_, next) => setPage(next)}
        />
      )}
    </Dialog>
  );
}
