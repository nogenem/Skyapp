import { initialState } from '~/redux/theme/reducer';
import type { TThemeState } from '~/redux/theme/types';

interface IOptions {
  useInitialState: boolean;
}

export default (
  override?: Partial<TThemeState>,
  options?: Partial<IOptions>,
): TThemeState =>
  options?.useInitialState
    ? initialState
    : ({
        mode:
          Math.random() < 0.2
            ? undefined
            : Math.random() < 0.5
            ? 'dark'
            : 'light',
        ...(override || {}),
      } as TThemeState);

export type { IOptions };