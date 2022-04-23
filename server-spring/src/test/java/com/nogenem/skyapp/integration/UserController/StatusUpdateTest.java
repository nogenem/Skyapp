package com.nogenem.skyapp.integration.UserController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nogenem.skyapp.BaseSpringTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.user.UpdateStatusRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class StatusUpdateTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to change user status")
  public void shouldBeAbleToChangeUserStatus() throws Exception {
    UserStatus oldUserStatus = UserStatus.ACTIVE;
    UserStatus newUserStatus = UserStatus.AWAY;

    User loggedInUser = ModelFactory.getTestUser();
    loggedInUser.setStatus(oldUserStatus);
    this.userRepo.save(loggedInUser);

    UpdateStatusRequestBody requestBody = new UpdateStatusRequestBody(newUserStatus);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/user/status")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_USER_STATUS_CHANGED), any());

    User savedUser = this.userRepo.findByEmail(loggedInUser.getEmail()).get();
    assertThat(savedUser.getStatus()).isEqualTo(newUserStatus);
  }

  @Test
  @DisplayName("should return 304 (Not Modified) if trying to change to the same status")
  public void shouldReturn304IfTryingToChangeToSameStatus() throws Exception {
    UserStatus oldUserStatus = UserStatus.ACTIVE;
    UserStatus newUserStatus = UserStatus.ACTIVE; // same

    User loggedInUser = ModelFactory.getTestUser();
    loggedInUser.setStatus(oldUserStatus);
    this.userRepo.save(loggedInUser);

    UpdateStatusRequestBody requestBody = new UpdateStatusRequestBody(newUserStatus);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/user/status")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isNotModified());
  }

}
