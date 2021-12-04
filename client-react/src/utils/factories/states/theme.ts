import { initialState } from '~/redux/theme/reducer';
import type { TThemeState, TThemeMode } from '~/redux/theme/types';

interface IOptions {
  useConstValues: boolean;
  useInitialState: boolean;
}

export default (
  override?: Partial<TThemeState>,
  options?: Partial<IOptions>,
): TThemeState => {
  let mode: TThemeMode | undefined =
    Math.random() < 0.2 ? undefined : Math.random() < 0.5 ? 'dark' : 'light';
  if (options?.useConstValues) mode = 'dark';

  return options?.useInitialState
    ? initialState
    : ({
        mode,
        ...(override || {}),
      } as TThemeState);
};

export type { IOptions };
