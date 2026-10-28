import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { ShellForm } from '../components/ShellForm';
import { useCategoryDefinition } from '../hooks/useCategoryDefinition';
import type { EmitFn, ShellManageConfig } from '../types';

export interface ShellCreateViewProps {
  config: ShellManageConfig;
  emit: EmitFn;
}

export function ShellCreateView({ config, emit }: ShellCreateViewProps) {
  const { state, retry } = useCategoryDefinition(config, emit);
  // Remount the form after a successful create so it starts empty again.
  const [formKey, setFormKey] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  return (
    // color: inherited CSS (e.g. a dark host page's text color) crosses the shadow boundary.
    <Box sx={{ p: 3, color: 'text.primary' }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Create Shell
      </Typography>

      {state.status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {state.status === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          {state.message}
        </Alert>
      )}

      {createdId && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setCreatedId(null)}>
          Shell created ({createdId})
        </Alert>
      )}

      {state.status === 'ready' &&
        (state.definition.forms?.create?.properties?.length ? (
          <ShellForm
            key={formKey}
            config={config}
            sections={state.definition.forms.create.properties}
            emit={emit}
            onCreated={(identifier) => {
              setCreatedId(identifier);
              setFormKey((k) => k + 1);
            }}
            onCancel={() => emit('shell:cancel')}
          />
        ) : (
          <Alert severity="warning">No create form is configured for the Shell category.</Alert>
        ))}
    </Box>
  );
}
