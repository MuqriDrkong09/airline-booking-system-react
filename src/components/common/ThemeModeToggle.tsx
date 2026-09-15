import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useUiStore } from '@/app/store/uiStore';

export function ThemeModeToggle() {
  const theme = useTheme();
  const toggleColorScheme = useUiStore((state) => state.toggleColorScheme);
  const isDark = theme.palette.mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        color="inherit"
        onClick={toggleColorScheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun aria-hidden="true" size={20} /> : <Moon aria-hidden="true" size={20} />}
      </IconButton>
    </Tooltip>
  );
}
