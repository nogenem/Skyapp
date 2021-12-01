import { initialState } from '~/redux/user/reducer';
import type { TUserState } from '~/redux/user/types';

import { user as userFactory } from '../models';

interface IOptions {
  useInitialState: boolean;
}

export default (
  override?: Partial<TUserState>,
  options?: Partial<IOptions>,
): TUserState =>
  options?.useInitialState ? initialState : userFactory(override);

export type { IOptions };
