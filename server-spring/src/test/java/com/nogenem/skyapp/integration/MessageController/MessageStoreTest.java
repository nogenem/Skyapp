package com.nogenem.skyapp.integration.MessageController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.nogenem.skyapp.requestBody.message.StoreMessageRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class MessageStoreTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Autowired
  private MessageRepository messageRepo;

  @Test
  @DisplayName("should be able to send a text message")
  public void shouldBeAbleToSendTextMessage() throws Exception {
    String body = "Some message";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    StoreMessageRequestBody requestBody = new StoreMessageRequestBody(body);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/{channelId}/messages", channel.getId())
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isCreated())
      .andExpect(jsonPath("$.messageObj").isNotEmpty());

    List<Message> savedMessages = this.messageRepo.findByBody(body);
    assertThat(savedMessages).hasSize(1);
  }

  @Test
  @DisplayName("should not be able to send a text message with an invalid channelId")
  public void shouldNotBeAbleToSendTextMessageWithInvalidChannelId() throws Exception {
    String body = "Some message";
    String channelId = "some-channel-id";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    StoreMessageRequestBody requestBody = new StoreMessageRequestBody(body);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/{channelId}/messages", channelId)
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to send a text message to a channel that you are not a member of")
  public void shouldNotBeAbleToSendTextMessageToChannelYouAreNotMemberOf() throws Exception {
    String body = "Some message";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    Channel channel = ModelFactory.getTestChannel(List.of(otherUser1, otherUser2));
    this.channelRepo.save(channel);

    StoreMessageRequestBody requestBody = new StoreMessageRequestBody(body);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/{channelId}/messages", channel.getId())
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
