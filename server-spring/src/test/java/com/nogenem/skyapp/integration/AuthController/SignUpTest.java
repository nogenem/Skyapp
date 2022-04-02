package com.nogenem.skyapp.integration.AuthController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Optional;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.SignUpRequestBody;
import com.nogenem.skyapp.service.MailService;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class SignUpTest extends BaseIntegrationTest {

  @MockBean
  private MailService mailService;

  @MockBean
  private SocketIoService socketIoService;

  @MockBean
  private TokenService tokenService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to sign up and should send a confirmation email")
  public void shouldBeAbleToSignUpAndSendConfirmationEmail() throws Exception {
    String email = "test@test.com";
    SignUpRequestBody requestBody = new SignUpRequestBody("Test 1", email, "test123", "test123");

    String confirmationToken = "some-token";
    when(this.tokenService.generateToken(any(), any())).thenReturn(confirmationToken);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isCreated())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.token").value(confirmationToken));

    verify(this.mailService, times(1)).sendConfirmationEmail(anyString(), anyString(), any());

    Optional<User> user = this.userRepo.findByEmail(email);
    assertThat(user.isPresent()).isTrue();
  }

  @Test
  @DisplayName("should not be able to sign up with missing credentials")
  public void shouldNotBeAbleToSignUpWithMissingCredentials() throws Exception {
    String email = "test@test.com";
    SignUpRequestBody requestBody = new SignUpRequestBody("Test 1", email, "", "");

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isNotEmpty());

    Optional<User> user = this.userRepo.findByEmail(email);
    assertThat(user.isPresent()).isFalse();
  }

  @Test
  @DisplayName("should not be able to sign up with an already existing email")
  public void shouldNotBeAbleToSignUpWithAnAlreadyExistingEmail() throws Exception {
    String email = "test@test.com";

    User user = new User(
        "123", "Test 1", email, "test123", false, "", "", UserStatus.ACTIVE,
        "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    SignUpRequestBody requestBody = new SignUpRequestBody("Test 2", email, "test123", "test123");

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signup")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
