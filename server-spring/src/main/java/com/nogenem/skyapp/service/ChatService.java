package com.nogenem.skyapp.service;

import java.util.HashMap;
import java.util.List;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatUserDTO;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.MessageRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.response.ChatInitialData;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ChatService {

  private final ChannelRepository channelRepository;
  private final UserRepository userRepository;
  private final MessageRepository messageRepository;

  public List<Channel> getUserChannelsWithLastMessage(String userId) {
    return this.channelRepository.findUserChannelsWithLastMessage(userId).getMappedResults();
  }

  public ChatInitialData getChatInitialData(String currentUserId, HashMap<String, String> currentUsers) {
    List<Channel> tmpChannels = this.getUserChannelsWithLastMessage(currentUserId);
    List<User> tmpUsers = this.userRepository.findOtherUsers(currentUserId);

    HashMap<String, String> userIdToChannelId = new HashMap<>();
    ChatInitialData initialData = new ChatInitialData();

    for (Channel channel : tmpChannels) {
      int unreadMsgs = 0;
      Integer otherMemberIdx = null;

      Member member = channel.getMembers().stream()
          .filter(m -> m.getUserId().equals(currentUserId))
          .findAny()
          .orElse(null);

      if (member != null) {
        unreadMsgs = this.messageRepository.countUnreadMessages(channel.getId(), member.getLastSeen());

        if (!channel.getIsGroup()) {
          int memberIdx = channel.getMembers().indexOf(member);
          otherMemberIdx = memberIdx == 0 ? 1 : 0;

          Member otherMember = channel.getMembers().get(otherMemberIdx);
          userIdToChannelId.put(otherMember.getUserId(), channel.getId());
        }
      }

      ChatChannelDTO dto = new ChatChannelDTO(channel, otherMemberIdx, unreadMsgs);
      initialData.getChannels().put(channel.getId(), dto);
    }

    for (User user : tmpUsers) {
      Boolean online = currentUsers.containsKey(user.getId());
      String channelId = null;

      if (userIdToChannelId.containsKey(user.getId())) {
        channelId = userIdToChannelId.get(user.getId());
        initialData.getChannels().get(channelId).setName(user.getNickname());
      }

      ChatUserDTO dto = new ChatUserDTO(user, online, channelId);
      initialData.getUsers().put(user.getId(), dto);
    }

    return initialData;
  }
}
