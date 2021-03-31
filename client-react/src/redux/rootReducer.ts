import { combineReducers } from 'redux';

import theme from './theme/reducer';
import user from './user/reducer';

export default combineReducers({
  user,
  theme,
});
