package com.nogenem.skyapp.integration.MessageController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.MessageRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.ResultActions;

public class MessageAllTest extends BaseIntegrationTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Test
  @DisplayName("should be able to get messages from a channel")
  public void shouldBeAbleToGetMessagesFromChannel() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(loggedInUser.getId());
    this.messageRepo.save(message);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(get("/api/channel/{channelId}/messages", channel.getId()));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.docs.length()").value(1))
      .andExpect(jsonPath("$.docs[0]._id").value(message.getId()));
  }

  @Test
  @DisplayName("should not be able to get messages with an invalid channelId")
  public void shouldNotBeAbleToGetMessagesWithInvalidChannelId() throws Exception {
    String channelId = "some-channel-id";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(loggedInUser.getId());
    this.messageRepo.save(message);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(get("/api/channel/{channelId}/messages", channelId));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to get messages from a channel that you are not a member of")
  public void shouldNotBeAbleToGetMessagesFromChannelYouAreNotMemberOf() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    Channel channel = ModelFactory.getTestChannel(List.of(otherUser1, otherUser2));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(otherUser1.getId());
    this.messageRepo.save(message);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(get("/api/channel/{channelId}/messages", channel.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
