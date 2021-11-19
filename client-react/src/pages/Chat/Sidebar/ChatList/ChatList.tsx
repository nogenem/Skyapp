import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Typography, List } from '@material-ui/core';
import debounce from 'lodash.debounce';

import { getChannelsList } from '~/redux/chat/reducer';
import { IChannel } from '~/redux/chat/types';
import { IAppState } from '~/redux/store';

import { ChatListItem } from './ChatListItem';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState) => ({
  channels: getChannelsList(state),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  filter: string;
  activeChannelId: string | undefined;
}

type TProps = TPropsFromRedux & IOwnProps;

const ChatList = ({ filter, activeChannelId, channels }: TProps) => {
  const [filteredChannels, setFilteredChannels] = React.useState(channels);
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  const updateFilteredChannels = (filter: string, channels: IChannel[]) => {
    if (!filter) {
      setFilteredChannels(channels);
    } else {
      setFilteredChannels(
        channels.filter(channel => channel.name.toLowerCase().includes(filter)),
      );
    }
  };

  const debouncedOnFilterChange = React.useCallback(
    debounce(updateFilteredChannels, 250),
    [],
  );

  React.useEffect(() => {
    debouncedOnFilterChange(filter, channels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, channels]);

  return (
    <>
      <Typography variant="subtitle2" className={classes.chatsText}>
        {trans('Common:CHATS')}
      </Typography>
      <List>
        {filteredChannels.map(channel => (
          <ChatListItem
            key={channel._id}
            channel={channel}
            selected={activeChannelId === channel._id}
          />
        ))}
      </List>
    </>
  );
};

export type { TProps };
export const UnconnectedChatList = ChatList;
export default connector(ChatList);
