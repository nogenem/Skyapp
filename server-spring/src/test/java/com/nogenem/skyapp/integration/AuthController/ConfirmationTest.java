package com.nogenem.skyapp.integration.AuthController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.ConfirmationRequestBody;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class ConfirmationTest extends BaseIntegrationTest {

  @MockBean
  private TokenService tokenService;

  @MockBean
  private SocketIoService socketIoService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to confirm the sign up")
  public void shouldBeAbleToConfirmSignUp() throws Exception {
    String confirmationToken = "some-confirmation-token";
    User user = new User(
      "123", "Test 1", "test@test.com", "test123", false, confirmationToken, "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    ConfirmationRequestBody requestBody = new ConfirmationRequestBody(confirmationToken);

    when(this.tokenService.isValidToken(eq(confirmationToken))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/confirmation")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.user").exists());

    verify(this.socketIoService, times(1)).emit(eq(SocketEvents.IO_NEW_USER), any());

    User dbUser = this.userRepo.findByEmail(user.getEmail()).get();
    assertThat(dbUser.getConfirmationToken()).isEqualTo("");
    assertThat(dbUser.getConfirmed()).isTrue();
  }

  @Test
  @DisplayName("should not be able to confirm with an invalid token")
  public void shouldNotBeAbleToConfirmWithInvalidToken() throws Exception {
    String confirmationToken1 = "some-confirmation-token";
    String confirmationToken2 = "another-confirmation-token";

    User user = new User(
      "123", "Test 1", "test@test.com", "test123", false, confirmationToken1, "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    ConfirmationRequestBody requestBody = new ConfirmationRequestBody(confirmationToken2);

    when(this.tokenService.isValidToken(eq(confirmationToken1))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/confirmation")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to confirm with the same token twice")
  public void shouldNotBeAbleToConfirmWithTheSameTokenTwice() throws Exception {
    String confirmationToken = "some-confirmation-token";
    User user = new User(
      "123", "Test 1", "test@test.com", "test123", false, confirmationToken, "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    ConfirmationRequestBody requestBody = new ConfirmationRequestBody(confirmationToken);

    when(this.tokenService.isValidToken(eq(confirmationToken))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/confirmation")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    resultActions = this.mvc.perform(post("/api/auth/confirmation")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest());
  }

}
