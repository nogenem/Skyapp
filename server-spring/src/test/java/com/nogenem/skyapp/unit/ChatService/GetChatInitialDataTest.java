package com.nogenem.skyapp.unit.ChatService;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;

import com.nogenem.skyapp.BaseSpringTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.DTO.ChatUserDTO;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.MessageRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.response.ChatInitialData;
import com.nogenem.skyapp.service.ChatService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class GetChatInitialDataTest extends BaseSpringTest {

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Autowired
  private ChatService chatService;

  @Test
  @DisplayName("should return the users and channels correctly")
  public void shouldReturnUsersAndChannels() {
    HashMap<String, String> currentUsers = new HashMap<>();

    User user1 = ModelFactory.getTestUser();
    user1.setConfirmed(true);
    this.userRepo.save(user1);

    User user2 = ModelFactory.getTestUser();
    user2.setConfirmed(true);
    this.userRepo.save(user2);

    Channel channel = ModelFactory.getTestChannel(List.of(user1, user2));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(user1.getId());
    this.messageRepo.save(message);

    ChatInitialData data = this.chatService.getChatInitialData(user1.getId(), currentUsers);

    HashMap<String, ChatUserDTO> users = data.getUsers();
    assertThat(users.size()).isEqualTo(1);
    assertThat(users.containsKey(user2.getId())).isTrue();

    HashMap<String, ChatChannelDTO> channels = data.getChannels();
    assertThat(channels.size()).isEqualTo(1);
    assertThat(channels.containsKey(channel.getId())).isTrue();

    ChatMessageDTO lastMessage = channels.get(channel.getId()).getLastMessage();
    assertThat(lastMessage).isNotNull();
    assertThat(lastMessage.get_id()).isEqualTo(message.getId());
  }

}
