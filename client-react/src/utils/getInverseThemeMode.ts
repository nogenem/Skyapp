import { TThemeMode } from '~/redux/theme/types';

// PS: This should be done automatically by the lib... ;/
export default (mode: TThemeMode) => (mode === 'dark' ? 'light' : 'dark');
