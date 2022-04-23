package com.nogenem.skyapp.integration.MessageController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.nogenem.skyapp.BaseSpringTest;
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

public class MessageDeleteTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Test
  @DisplayName("should be able to delete a text message")
  public void shouldBeAbleToDeleteTextMessage() throws Exception {
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
    ResultActions resultActions = this.mvc.perform(
      delete("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId()));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.messageObj").isNotEmpty());

    List<Message> savedMessages = this.messageRepo.findByBody(message.getBody());
    assertThat(savedMessages).hasSize(0);
  }

  @Test
  @DisplayName("should not be able to delete a text message with an invalid channelId")
  public void shouldNotBeAbleToDeleteTextMessageWithInvalidChannelId() throws Exception {
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
    ResultActions resultActions = this.mvc.perform(
      delete("/api/channel/{channelId}/messages/{messageId}", channelId, message.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to delete a text message with an invalid messageId")
  public void shouldNotBeAbleToDeleteTextMessageWithInvalidMessageId() throws Exception {
    String messageId = "some-message-id";

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
    ResultActions resultActions = this.mvc.perform(
      delete("/api/channel/{channelId}/messages/{messageId}", channel.getId(), messageId));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to delete a text message that is not yours")
  public void shouldNotBeAbleToDeleteTextMessageThatIsNotYours() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(otherUser1.getId()); // other user
    this.messageRepo.save(message);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      delete("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to delete a text message on a channel that you are not a member of")
  public void shouldNotBeAbleToDeleteTextMessageOnChannelThatYouAreNotAMemberOf() throws Exception {
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
    message.setFromId(loggedInUser.getId());
    this.messageRepo.save(message);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      delete("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
