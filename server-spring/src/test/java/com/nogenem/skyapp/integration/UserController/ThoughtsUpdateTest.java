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
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.user.UpdateThoughtsRequestBody;
import com.nogenem.skyapp.service.SocketIoService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class ThoughtsUpdateTest extends BaseSpringTest {

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to change user thoughts")
  public void shouldBeAbleToChangeUserThoughts() throws Exception {
    String oldThoughts = "Some thoughts";
    String newThoughts = "Some new thoughts";

    User loggedInUser = ModelFactory.getTestUser();
    loggedInUser.setThoughts(oldThoughts);
    this.userRepo.save(loggedInUser);

    UpdateThoughtsRequestBody requestBody = new UpdateThoughtsRequestBody(newThoughts);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/user/thoughts")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_USER_THOUGHTS_CHANGED), any());

    User savedUser = this.userRepo.findByEmail(loggedInUser.getEmail()).get();
    assertThat(savedUser.getThoughts()).isEqualTo(newThoughts);
  }

  @Test
  @DisplayName("should return 304 (Not Modified) if trying to change to the same thoughts")
  public void shouldReturn304IfTryingToChangeToSameThoughts() throws Exception {
    String oldThoughts = "Some thoughts";
    String newThoughts = "Some thoughts"; // same

    User loggedInUser = ModelFactory.getTestUser();
    loggedInUser.setThoughts(oldThoughts);
    this.userRepo.save(loggedInUser);

    UpdateThoughtsRequestBody requestBody = new UpdateThoughtsRequestBody(newThoughts);

    this.logInTestUser(loggedInUser);
    ResultActions resultActions = this.mvc.perform(patch("/api/user/thoughts")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isNotModified());
  }

}
