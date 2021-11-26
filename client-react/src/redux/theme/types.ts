type TThemeMode = 'dark' | 'light';

type TThemeState = {
  mode?: TThemeMode;
};

enum EThemeActions {
  MODE_SWITCHED = '@theme/MODE_SWITCHED',
}

interface IThemeActionType<T, P> {
  type: T;
  payload: P;
}

type TThemeAction = IThemeActionType<
  typeof EThemeActions.MODE_SWITCHED,
  TThemeMode
>;

export type { TThemeMode, TThemeState, TThemeAction };
export { EThemeActions };
