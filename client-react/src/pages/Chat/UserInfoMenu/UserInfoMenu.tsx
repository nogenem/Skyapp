import React, { MouseEvent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Menu, MenuItem, Typography } from '@material-ui/core';

import { ChatAvatar } from '~/components';
import { IAppState } from '~/redux/store';
import { userSignedOut as userSignedOutAction } from '~/redux/user/actions';
import { getNickname } from '~/redux/user/reducer';

import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  userNickname: getNickname(state),
});
const mapDispatchToProps = {
  userSignedOut: userSignedOutAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

type TProps = TPropsFromRedux;

const UserInfoMenu = ({ userNickname, userSignedOut }: TProps) => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const classes = useStyles();

  const handleClick = (event: MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    userSignedOut();
  };

  return (
    <>
      <div className={classes.container} onClick={handleClick}>
        <ChatAvatar online />
        <div className={classes.textContainer}>
          <Typography
            component="span"
            variant="subtitle1"
            noWrap
            color="inherit"
            title={userNickname}
          >
            {userNickname}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            noWrap
            color="textSecondary"
            title="Some status message..."
          >
            Some status message...
          </Typography>
        </div>
      </div>
      <Menu
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        id="user-info-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menu }}
      >
        <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
      </Menu>
    </>
  );
};

export type { TProps };
export const UnconnectedUserInfoMenu = UserInfoMenu;
export default connector(UserInfoMenu);
