package com.nogenem.skyapp.integration.MessageController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.nogenem.skyapp.BaseSpringTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.model.Attachment;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.MessageRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.message.UpdateMessageRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class MessageUpdateTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Test
  @DisplayName("should be able to edit a text message")
  public void shouldBeAbleToEditTextMessage() throws Exception {
    String oldBody = "Some message";
    String newBody = "Some new message";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(loggedInUser.getId());
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.messageObj").isNotEmpty());

    List<Message> savedMessages = this.messageRepo.findByBody(newBody);
    assertThat(savedMessages).hasSize(1);
  }

  @Test
  @DisplayName("should not be able to edit a text message with an invalid channelId")
  public void shouldNotBeAbleToEditTextMessageWithInvalidChannelId() throws Exception {
    String oldBody = "Some message";
    String newBody = "Some new message";
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
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channelId, message.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to edit a text message with an invalid messageId")
  public void shouldNotBeAbleToEditTextMessageWithInvalidMessageId() throws Exception {
    String oldBody = "Some message";
    String newBody = "Some new message";
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
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channel.getId(), messageId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to edit a text message that is not yours")
  public void shouldNotBeAbleToEditTextMessageThatIsNotYours() throws Exception {
    String oldBody = "Some message";
    String newBody = "Some new message";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(otherUser1.getId()); // other user
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to edit a file message")
  public void shouldNotBeAbleToEditFileMessage() throws Exception {
    Attachment oldBody = ModelFactory.getTestAttachment();
    String newBody = "Some new message";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    Message message = ModelFactory.getTestMessage();
    message.setChannelId(channel.getId());
    message.setFromId(loggedInUser.getId());
    message.setType(MessageType.UPLOADED_FILE);
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to edit a text message on a channel that you are not a member of")
  public void shouldNotBeAbleToEditTextMessageOnChannelThatYouAreNotAMemberOf() throws Exception {
    String oldBody = "Some message";
    String newBody = "Some new message";

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
    message.setBody(oldBody);
    this.messageRepo.save(message);

    UpdateMessageRequestBody requestBody = new UpdateMessageRequestBody(newBody);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(
      patch("/api/channel/{channelId}/messages/{messageId}", channel.getId(), message.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
