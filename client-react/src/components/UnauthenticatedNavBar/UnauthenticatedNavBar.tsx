import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { AppBar as MuiAppBar, Toolbar, Typography } from '@material-ui/core';

import type { IAppState } from '~/redux/store';
import { getToken } from '~/redux/user/reducer';

const mapStateToProps = (state: IAppState) => ({
  isAuthenticated: !!getToken(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UnauthenticatedNavBar = ({ isAuthenticated }: TProps) => {
  if (isAuthenticated) return null;

  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" noWrap>
          SkyApp
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};

export type { TProps };
export const UnconnectedUnauthenticatedNavBar = UnauthenticatedNavBar;
export default connector(UnauthenticatedNavBar);
