import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Router as ReachRouter } from '@reach/router';

import type { AppState } from '~/redux/store';
import { getToken } from '~/redux/user/reducer';

const mapStateToProps = (state: AppState) => ({
  isAuthenticated: !!getToken(state),
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const defaultProps = {
  isPrivate: false,
};

interface OwnProps {
  children: React.ReactNode;
}
type Props = OwnProps & typeof defaultProps & PropsFromRedux;

const Router = ({ isPrivate, isAuthenticated, children }: Props) => {
  if ((isPrivate && !isAuthenticated) || (!isPrivate && isAuthenticated))
    return <div />;
  return (
    // https://github.com/reach/router/issues/63
    <ReachRouter primary={false} component={React.Fragment}>
      {children}
    </ReachRouter>
  );
};

Router.defaultProps = defaultProps;

export type { Props };
export const UnconnectedRouter = Router;
export default connector(Router);
