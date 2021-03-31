type TThemeMode = 'dark' | 'light';

type TThemeState = {
  mode?: TThemeMode;
};

enum EThemeActions {
  SWITCH_MODE = '@theme/SWITCH_MODE',
}

interface IThemeActionType<T, P> {
  type: T;
  payload: P;
}

type TThemeAction = IThemeActionType<
  typeof EThemeActions.SWITCH_MODE,
  TThemeMode
>;

export type { TThemeMode, TThemeState, TThemeAction };
export { EThemeActions };
