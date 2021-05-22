import React from 'react';
import { useTranslation } from 'react-i18next';

import { Paper, IconButton } from '@material-ui/core';
import {
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@material-ui/icons';

import { TextInput } from '~/components';

import { NewChatModal } from '../NewChatModal';
import { NewGroupModal } from '../NewGroupModal';
import { UserInfoMenu } from '../UserInfoMenu';
import useStyles from './useStyles';

interface IOwnProps {
  isUserEmailConfirmed: boolean;
}

type TProps = IOwnProps;

const Sidebar = ({ isUserEmailConfirmed }: TProps) => {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = React.useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState(false);
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
