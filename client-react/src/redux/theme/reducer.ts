import { EThemeActions } from './types';
import type { TThemeAction, TThemeState } from './types';

export const initialState: TThemeState = {
  mode: undefined,
};

const theme = (state = initialState, action: TThemeAction): TThemeState => {
  switch (action.type) {
    case EThemeActions.MODE_SWITCHED:
      return {
        ...state,
        mode: action.payload,
      };
    default:
      return state;
  }
};

export default theme;
