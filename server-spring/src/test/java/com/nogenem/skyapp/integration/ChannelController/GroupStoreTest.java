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

import com.nogenem.skyapp.BaseSpringTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.ChannelRepository;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.channel.StoreGroupChannelRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class GroupStoreTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Autowired
  private ChannelRepository channelRepo;

  @Test
  @DisplayName("should be able to create a new group channel")
  public void shouldBeAbleToCreateGroupChannel() throws Exception {
    String groupName = "Some group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);
    User otherUser1 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser1);
    User otherUser2 = ModelFactory.getTestUser();
    this.userRepo.save(otherUser2);

    String[] members = new String[]{otherUser1.getId(), otherUser2.getId()};
    String[] admins = new String[]{loggedInUser.getId()};
    StoreGroupChannelRequestBody requestBody = new StoreGroupChannelRequestBody(groupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isCreated())
      .andExpect(jsonPath("$.channelId").isNotEmpty());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_GROUP_CHANNEL_CREATED), any());

    List<Channel> channels = this.channelRepo.findByName(groupName);
    assertThat(channels).hasSize(1);
    assertThat(channels.get(0).getMembers()).hasSize(3);
    assertThat(channels.get(0).getMembers().get(0).getIsAdm()).isTrue();
  }

  @Test
  @DisplayName("should not be able to create a new group channel with invalid memberIds")
  public void shouldNotBeAbleToCreateGroupChannelWithInvalidMemberIds() throws Exception {
    String groupName = "Some group name";

    User loggedInUser = ModelFactory.getTestUser();
    this.userRepo.save(loggedInUser);

    String[] members = new String[]{"some-member-id-1", "some-member-id-2"};
    String[] admins = new String[]{loggedInUser.getId()};
    StoreGroupChannelRequestBody requestBody = new StoreGroupChannelRequestBody(groupName, members, admins);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(post("/api/channel/group")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
