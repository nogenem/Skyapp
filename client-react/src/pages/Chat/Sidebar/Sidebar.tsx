import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Paper, IconButton } from '@material-ui/core';
import {
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@material-ui/icons';

import { TextInput, NewChatModal, NewGroupModal } from '~/components';
import useMediaQuery from '~/hooks/useMediaQuery';
import { getActiveChannelId } from '~/redux/chat/reducer';
import { IAppState } from '~/redux/store';

import { ChatList } from './ChatList';
import { UserInfoMenu } from './UserInfoMenu';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  activeChannelId: getActiveChannelId(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  isUserEmailConfirmed: boolean;
}

type TProps = IOwnProps & TPropsFromRedux;

const Sidebar = ({ isUserEmailConfirmed, activeChannelId }: TProps) => {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const isSmall = useMediaQuery('(max-width: 875px)');
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  const handleNewChatModalOpen = () => {
    setIsNewChatModalOpen(true);
  };

  const handleNewChatModalClose = () => {
    setIsNewChatModalOpen(false);
  };

  const handleNewGroupModalOpen = () => {
    setIsNewGroupModalOpen(true);
  };

  const handleNewGroupModalClose = () => {
    setIsNewGroupModalOpen(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value.toLowerCase());
  };

  const extraClassName = getExtraClassName(isSmall, activeChannelId);
  return (
    <>
      <Paper
        square
        className={`${classes.container} ${extraClassName}`}
        elevation={8}
      >
        <UserInfoMenu />

        {isUserEmailConfirmed && (
          <>
            <TextInput
              id="chat-sidebar-search"
              name="search"
              label={trans('Common:Search')}
              autoComplete="search"
              type="text"
              fullWidth
              variant="outlined"
              margin="dense"
              onChange={handleFilterChange}
            />

            <div className={classes.btnsContainer}>
              <IconButton
                aria-label={trans('Common:New Chat')}
                title={trans('Common:New Chat')}
                onClick={handleNewChatModalOpen}
              >
                <PersonAddIcon />
              </IconButton>
              <IconButton
                aria-label={trans('Common:New Group')}
                title={trans('Common:New Group')}
                onClick={handleNewGroupModalOpen}
              >
                <GroupAddIcon />
              </IconButton>
            </div>

            <ChatList filter={filter} activeChannelId={activeChannelId} />
          </>
        )}
      </Paper>
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={handleNewChatModalClose}
      />
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={handleNewGroupModalClose}
      />
    </>
  );
};

const getExtraClassName = (
  isSmall: boolean,
  activeChannelId: string | undefined,
) => {
  let extraClassName = '';
  if (isSmall && !!activeChannelId) {
    extraClassName = 'hidden';
  } else if (isSmall && !activeChannelId) {
    extraClassName = 'expanded';
  }
  return extraClassName;
};

export type { TProps };
export const UnconnectedSidebar = Sidebar;
export default connector(Sidebar);
