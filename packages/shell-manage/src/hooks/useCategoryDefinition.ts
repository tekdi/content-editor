import { useCallback, useEffect, useState } from 'react';
import { readShellCategoryDefinition } from '../api/categoryDefinition';
import type { CategoryDefinition, EmitFn, ShellManageConfig } from '../types';

export type DefinitionState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; definition: CategoryDefinition };

/** Loads the Shell category definition; re-fetches when baseurl/channel change. */
export function useCategoryDefinition(config: ShellManageConfig, emit: EmitFn) {
  const [state, setState] = useState<DefinitionState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    readShellCategoryDefinition(config)
      .then((definition) => {
        if (cancelled) return;
        setState({ status: 'ready', definition });
        emit('shell:ready', { identifier: definition.identifier });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load shell form';
        setState({ status: 'error', message });
        emit('shell:error', { message, cause: err });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.baseurl, config.channel, reloadKey]);

  return { state, retry };
}
