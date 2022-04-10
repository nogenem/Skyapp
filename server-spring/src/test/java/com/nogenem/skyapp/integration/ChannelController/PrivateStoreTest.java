package com.nogenem.skyapp.integration.ChannelController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.channel.StorePrivateChannelRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class PrivateStoreTest extends BaseIntegrationTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Test
  @DisplayName("should be able to create a new private channel")
  public void shouldBeAbleToCreatePrivateChannel() throws Exception {
    User loggedInUser = this.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser = this.getTestUser();
    this.userRepo.save(otherUser);

    StorePrivateChannelRequestBody requestBody = new StorePrivateChannelRequestBody(otherUser.getId());

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/private")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isCreated())
      .andExpect(jsonPath("$.channelId").isNotEmpty());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_PRIVATE_CHANNEL_CREATED), any());

    Optional<Channel> channel = this.channelRepo.findPrivateChannel(loggedInUser.getId(), otherUser.getId());
    assertThat(channel.isPresent()).isTrue();
  }

  @Test
  @DisplayName("should not be able to create a new private channel with an invalid userId")
  public void shouldNotBeAbleToCreatePrivateChannelWithInvalidUserId() throws Exception {
    String otherUserId = "some-user-id";

    User loggedInUser = this.getTestUser();
    this.userRepo.save(loggedInUser);

    StorePrivateChannelRequestBody requestBody = new StorePrivateChannelRequestBody(otherUserId);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/private")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to create a new private channel if the users are already chatting")
  public void shouldNotBeAbleToCreatePrivateChannelIfUsersAreAlreadyChatting() throws Exception {
    User loggedInUser = this.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser = this.getTestUser();
    this.userRepo.save(otherUser);

    Channel channel = this.getTestChannel(List.of(loggedInUser, otherUser));
    this.channelRepo.save(channel);

    StorePrivateChannelRequestBody requestBody = new StorePrivateChannelRequestBody(otherUser.getId());

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/private")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
