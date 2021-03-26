import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Router as ReachRouter } from '@reach/router';

import type { IAppState } from '~/redux/store';
import { getToken } from '~/redux/user/reducer';

const mapStateToProps = (state: IAppState) => ({
  isAuthenticated: !!getToken(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

const defaultProps = {
  isPrivate: false,
};

interface IOwnProps {
  children: React.ReactNode;
}
type TProps = IOwnProps & typeof defaultProps & TPropsFromRedux;

const Router = ({ isPrivate, isAuthenticated, children }: TProps) => {
  if ((isPrivate && !isAuthenticated) || (!isPrivate && isAuthenticated))
    return null;
  return (
    // https://github.com/reach/router/issues/63
    <ReachRouter primary={false} component={React.Fragment}>
      {children}
    </ReachRouter>
  );
};

Router.defaultProps = defaultProps;

export type { TProps };
export const UnconnectedRouter = Router;
export default connector(Router);
