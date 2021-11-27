import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
  Redirect as RouterRedirect,
  RedirectProps,
  RouteComponentProps,
} from '@reach/router';

import type { IAppState } from '~/redux/store';
import { selectUserToken } from '~/redux/user/selectors';

const mapStateToProps = (state: IAppState) => ({
  isAuthenticated: !!selectUserToken(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux & RouteComponentProps<RedirectProps<unknown>>;

const Redirect = ({ isAuthenticated, navigate }: TProps) => {
  if (isAuthenticated)
    return <RouterRedirect to="/chat" noThrow navigate={navigate} />;
  return <RouterRedirect to="/signin" noThrow navigate={navigate} />;
};

export type { TProps };
export const UnconnectedRedirect = Redirect;
export default connector(Redirect);
