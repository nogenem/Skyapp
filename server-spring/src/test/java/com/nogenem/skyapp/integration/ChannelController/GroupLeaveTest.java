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

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.ResultActions;

public class GroupLeaveTest extends BaseIntegrationTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Test
  @DisplayName("should be able to leave a group channel")
  public void shouldBeAbleToLeaveGroupChannel() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);
    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    this.channelRepo.save(channel);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group/{channelId}/leave", channel.getId()));

    resultActions.andExpect(status().isOk());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL), any());
    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_GROUP_CHANNEL_UPDATED), any());
    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_MESSAGES_RECEIVED), any());

    List<Channel> savedChannels = this.channelRepo.findByName(channel.getName());
    assertThat(savedChannels).hasSize(1);

    List<Member> savedMembers = savedChannels.get(0).getMembers();
    assertThat(savedMembers).hasSize(2);
    assertThat(savedMembers.get(0).getUserId()).isNotEqualTo(loggedInUser.getId());
    assertThat(savedMembers.get(0).getIsAdm()).isTrue();
    assertThat(savedMembers.get(1).getUserId()).isNotEqualTo(loggedInUser.getId());
    assertThat(savedMembers.get(1).getIsAdm()).isTrue();
  }

  @Test
  @DisplayName("should be able to leave a group channel and if there is less than 2 members left, the channel should be deleted")
  public void shouldBeAbleToLeaveGroupChannelAndDeleteItIfLessThan2MembersLeft() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    channel.setIsGroup(true);
    this.channelRepo.save(channel);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group/{channelId}/leave", channel.getId()));

    resultActions.andExpect(status().isOk());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL), any());

    List<Channel> savedChannels = this.channelRepo.findByName(channel.getName());
    assertThat(savedChannels).hasSize(0);
  }

  @Test
  @DisplayName("should not be able to leave a group channel with an invalid channelId")
  public void shouldNotBeAbleToLeaveGroupChannelWithInvalidChannelId() throws Exception {
    String channelId = "some-channel-id";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);
    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    this.channelRepo.save(channel);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group/{channelId}/leave", channelId));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to leave a private channel")
  public void shouldNotBeAbleToLeavePrivateChannel() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1));
    this.channelRepo.save(channel);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group/{channelId}/leave", channel.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to leave a group channel that you are not a member of")
  public void shouldNotBeAbleToLeaveGroupChannelYouAreNotMemberOf() throws Exception {
    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);
    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);
    User otherUser3 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser3);

    Channel channel = ModelFactory.getTestChannel(List.of(otherUser1, otherUser2, otherUser3));
    this.channelRepo.save(channel);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group/{channelId}/leave", channel.getId()));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }
}
