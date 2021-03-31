import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';
import type { TThemeState } from './theme/types';
import type { TUserState } from './user/types';

interface IAppState {
  user: TUserState;
  theme: TThemeState;
}

let enhancer = applyMiddleware(thunk);
if (process.env.NODE_ENV !== 'production')
  enhancer = composeWithDevTools(enhancer);

export type { IAppState };
export default createStore(rootReducer, {}, enhancer);
