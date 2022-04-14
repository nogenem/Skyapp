package com.nogenem.skyapp.integration.ChannelController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import com.nogenem.skyapp.requestBody.channel.UpdateGroupChannelRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class GroupUpdateTest extends BaseIntegrationTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Test
  @DisplayName("should be able to update a group channel")
  public void shouldBeAbleToUpgradeGroupChannel() throws Exception {
    String oldGroupName = "Some group name";
    String newGroupName = "Some NEW group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    User newUser = ModelFactory.getTestUser();
    this.userRepo.save(newUser);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    channel.setName(oldGroupName);
    this.channelRepo.save(channel);

    String[] members = new String[]{
      otherUser1.getId(),
      otherUser2.getId(),
      newUser.getId() // New member
    };
    String[] admins = new String[]{
      loggedInUser.getId(),
      newUser.getId() // New admin
    };
    UpdateGroupChannelRequestBody requestBody = new UpdateGroupChannelRequestBody(newGroupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/channel/group/{channelId}", channel.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.channelId").isNotEmpty());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL), any());
    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_GROUP_CHANNEL_UPDATED), any());
    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_MESSAGES_RECEIVED), any());

    List<Channel> savedChannels = this.channelRepo.findByName(newGroupName);
    assertThat(savedChannels).hasSize(1);

    List<Member> savedMembers = savedChannels.get(0).getMembers();
    assertThat(savedMembers).hasSize(4);

    Member savedMember = savedMembers.get(savedMembers.size() - 1);
    assertThat(savedMember.getUserId()).isEqualTo(newUser.getId());
    assertThat(savedMember.getIsAdm()).isTrue();
  }

  @Test
  @DisplayName("should not be able to update a group channel with invalid channelId")
  public void shouldNotBeAbleToUpgradeGroupChannelWithInvalidChannelId() throws Exception {
    String oldGroupName = "Some group name";
    String newGroupName = "Some NEW group name";
    String channelId = "some-channel-id";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    User newUser = ModelFactory.getTestUser();
    this.userRepo.save(newUser);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    channel.setName(oldGroupName);
    this.channelRepo.save(channel);

    String[] members = new String[]{
      otherUser1.getId(),
      otherUser2.getId(),
      newUser.getId() // New member
    };
    String[] admins = new String[]{
      loggedInUser.getId(),
      newUser.getId() // New admin
    };
    UpdateGroupChannelRequestBody requestBody = new UpdateGroupChannelRequestBody(newGroupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/channel/group/{channelId}", channelId)
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to update a private channel")
  public void shouldNotBeAbleToUpgradePrivateChannel() throws Exception {
    String oldGroupName = "Some group name";
    String newGroupName = "Some NEW group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser = ModelFactory.getTestUser();
    this.userRepo.save(otherUser);

    User newUser = ModelFactory.getTestUser();
    this.userRepo.save(newUser);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser));
    channel.setName(oldGroupName);
    this.channelRepo.save(channel);

    String[] members = new String[]{
      otherUser.getId(),
      newUser.getId() // New member
    };
    String[] admins = new String[]{
      loggedInUser.getId(),
      newUser.getId() // New admin
    };
    UpdateGroupChannelRequestBody requestBody = new UpdateGroupChannelRequestBody(newGroupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/channel/group/{channelId}", channel.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to update a group channel when the user is not an admin")
  public void shouldNotBeAbleToUpgradeGroupChannelWhenNotAdmin() throws Exception {
    String oldGroupName = "Some group name";
    String newGroupName = "Some NEW group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    User newUser = ModelFactory.getTestUser();
    this.userRepo.save(newUser);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    channel.setName(oldGroupName);
    channel.getMembers().get(0).setIsAdm(false);
    this.channelRepo.save(channel);

    String[] members = new String[]{
      otherUser1.getId(),
      otherUser2.getId(),
      newUser.getId() // New member
    };
    String[] admins = new String[]{
      loggedInUser.getId(),
      newUser.getId() // New admin
    };
    UpdateGroupChannelRequestBody requestBody = new UpdateGroupChannelRequestBody(newGroupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/channel/group/{channelId}", channel.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to update a group channel with invalid memberIds")
  public void shouldNotBeAbleToUpgradeGroupChannelWithInvalidMemberIds() throws Exception {
    String oldGroupName = "Some group name";
    String newGroupName = "Some NEW group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);

    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    User newUser = ModelFactory.getTestUser();
    this.userRepo.save(newUser);

    Channel channel = ModelFactory.getTestChannel(List.of(loggedInUser, otherUser1, otherUser2));
    channel.setName(oldGroupName);
    this.channelRepo.save(channel);

    String[] members = new String[]{
      "some-member-id-1", // New member
      "some-member-id-2" // New member
    };
    String[] admins = new String[]{
      loggedInUser.getId(),
      "some-member-id-1" // New admin
    };
    UpdateGroupChannelRequestBody requestBody = new UpdateGroupChannelRequestBody(newGroupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/channel/group/{channelId}", channel.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
