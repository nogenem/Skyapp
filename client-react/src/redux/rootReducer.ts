import { combineReducers } from 'redux';

import chat from './chat/reducer';
import theme from './theme/reducer';
import user from './user/reducer';

export default combineReducers({
  user,
  theme,
  chat,
});
