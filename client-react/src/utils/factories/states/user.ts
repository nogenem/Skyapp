import { initialState } from '~/redux/user/reducer';
import type { TUserState } from '~/redux/user/types';

import { user as userFactory } from '../models';

interface IOptions {
  useConstValues: boolean;
  useInitialState: boolean;
}

export default (
  override?: Partial<TUserState>,
  options?: Partial<IOptions>,
): TUserState =>
  options?.useInitialState
    ? initialState
    : userFactory(override, { useConstValues: options?.useConstValues });

export type { IOptions };
