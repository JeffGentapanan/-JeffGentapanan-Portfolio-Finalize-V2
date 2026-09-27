import { useTheme } from '@/context/theme-context';
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span aria-hidden="true">{resolvedTheme === 'light' ? '☼' : '☾'}</span> Theme:{' '}
      {resolvedTheme === 'light' ? 'Light' : 'Dark'}
    </button>
  );
}
