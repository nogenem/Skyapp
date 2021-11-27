import React from 'react';
import { useTranslation } from 'react-i18next';

import { Paper, IconButton } from '@material-ui/core';
import {
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@material-ui/icons';

import { TextInput, NewChatModal, NewGroupModal } from '~/components';
import useDebounce from '~/hooks/useDebounce';

import { ChatList } from './ChatList';
import { UserInfoMenu } from './UserInfoMenu';
import useStyles from './useStyles';

interface IOwnProps {
  isUserEmailConfirmed: boolean;
  isSmall: boolean;
  activeChannelId: string | undefined;
}

type TProps = IOwnProps;

const Sidebar = ({
  isUserEmailConfirmed,
  isSmall,
  activeChannelId,
}: TProps) => {
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

  const debouncedHandleFilterChange = useDebounce(
    (value: string) => setFilter(value),
    250,
    [],
  );
  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleFilterChange(e.target.value.toLowerCase());
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
              onChange={onFilterChange}
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
export default Sidebar;
