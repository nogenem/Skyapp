import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';
import type { UserState } from './user/types';

interface AppState {
  user: UserState;
}

let enhancer = applyMiddleware(thunk);
if (process.env.NODE_ENV !== 'production')
  enhancer = composeWithDevTools(enhancer);

export type { AppState };
export default createStore(rootReducer, {}, enhancer);
