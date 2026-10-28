import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import type { ShellThemeConfig } from '../types';

const BUTTON_RADIUS: Record<NonNullable<ShellThemeConfig['buttonShape']>, number | string> = {
  square: 0,
  rounded: 4,
  pill: 999,
};

/**
 * MUI theme for a shell component: host colors / button shape from `config.theme`,
 * plus portal containers kept inside the shadow root. Invalid colors make MUI throw,
 * so the caller falls back to `buildShellTheme(container)` without host overrides.
 */
export function buildShellTheme(container: () => HTMLElement, themeConfig?: ShellThemeConfig): Theme {
  const palette: ThemeOptions['palette'] = {};
  if (themeConfig?.primary) palette.primary = { main: themeConfig.primary };
  if (themeConfig?.secondary) palette.secondary = { main: themeConfig.secondary };
  const radius = themeConfig?.buttonShape ? BUTTON_RADIUS[themeConfig.buttonShape] : undefined;

  return createTheme({
    palette,
    components: {
      MuiModal: { defaultProps: { container } },
      MuiDialog: { defaultProps: { container } },
      MuiPopover: { defaultProps: { container } },
      MuiMenu: { defaultProps: { container } },
      MuiPopper: { defaultProps: { container } },
      ...(radius !== undefined && { MuiButton: { styleOverrides: { root: { borderRadius: radius } } } }),
    },
  });
}
