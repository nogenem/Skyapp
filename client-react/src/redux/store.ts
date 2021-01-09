import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from './rootReducer';
import { UserState } from './user/types';

export interface AppState {
  user: UserState;
}

let enhancer = applyMiddleware(thunk);
if (process.env.NODE_ENV !== 'production')
  enhancer = composeWithDevTools(enhancer);

export default createStore(rootReducer, {}, enhancer);
