import React from 'react';
import { useTranslation } from 'react-i18next';

import { Paper, IconButton } from '@material-ui/core';
import {
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@material-ui/icons';

import { TextInput, NewChatModal, NewGroupModal } from '~/components';

import { ChatList } from '../ChatList';
import { UserInfoMenu } from '../UserInfoMenu';
import useStyles from './useStyles';

interface IOwnProps {
  isUserEmailConfirmed: boolean;
}

type TProps = IOwnProps;

const Sidebar = ({ isUserEmailConfirmed }: TProps) => {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('');
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

  return (
    <>
      <Paper square className={classes.container} elevation={8}>
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

            <ChatList filter={filter} />
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

export type { TProps };
export default Sidebar;
