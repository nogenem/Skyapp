import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Typography, List } from '@material-ui/core';

import { selectFilteredChatChannelsIdsList } from '~/redux/chat/selectors';
import { IAppState } from '~/redux/store';

import { ChatListItem } from './ChatListItem';
import useStyles from './useStyles';

const mapStateToProps = (state: IAppState, ownProps: IOwnProps) => ({
  channelsIds: selectFilteredChatChannelsIdsList(state, ownProps),
});
const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  filter: string;
  activeChannelId: string | undefined;
}

type TProps = TPropsFromRedux & IOwnProps;

const ChatList = ({ filter, activeChannelId, channelsIds }: TProps) => {
  const { t: trans } = useTranslation(['Common']);
  const classes = useStyles();

  return (
    <>
      <Typography variant="subtitle2" className={classes.chatsText}>
        {trans('Common:CHATS')}
      </Typography>
      <List>
        {channelsIds.map(channelId => (
          <ChatListItem
            key={channelId}
            channelId={channelId}
            selected={activeChannelId === channelId}
          />
        ))}
      </List>
    </>
  );
};

export type { TProps };
export const UnconnectedChatList = ChatList;
export default connector(ChatList);
