import { useEffect, useState } from 'react';
import { Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface ShellFilterValues {
  query: string;
}

export const EMPTY_FILTERS: ShellFilterValues = { query: '' };

export interface ShellFiltersProps {
  value: ShellFilterValues;
  onChange: (next: ShellFilterValues) => void;
}

const DEBOUNCE_MS = 400;

/** Side filter panel. Add new filters to ShellFilterValues + searchShells. */
export function ShellFilters({ value, onChange }: ShellFiltersProps) {
  const [query, setQuery] = useState(value.query);

  useEffect(() => setQuery(value.query), [value.query]);

  // Apply the search text after the user pauses typing.
  useEffect(() => {
    if (query === value.query) return;
    const timer = setTimeout(() => onChange({ ...value, query }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, value, onChange]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={600}>
          Filters
        </Typography>
        <TextField
          size="small"
          label="Search by name"
          placeholder="Shell name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange({ ...value, query });
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="text"
          size="small"
          disabled={!query && !value.query}
          onClick={() => {
            setQuery('');
            onChange(EMPTY_FILTERS);
          }}
        >
          Reset filters
        </Button>
      </Stack>
    </Paper>
  );
}
