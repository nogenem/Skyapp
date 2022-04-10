package com.nogenem.skyapp.integration.AuthController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.ResendConfirmationEmailRequestBody;
import com.nogenem.skyapp.service.MailService;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class ResendConfirmationTest extends BaseIntegrationTest {

  @MockBean
  private MailService mailService;

  @MockBean
  private TokenService tokenService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to resend a confirmation email")
  public void shouldBeAbleToResendConfirmationEmail() throws Exception {
    String oldConfirmationToken = "some-confirmation-token";
    String newConfirmationToken = "another-confirmation-token";

    User user = ModelFactory.getTestUser();
    user.setConfirmationToken(oldConfirmationToken);
    this.userRepo.save(user);

    ResendConfirmationEmailRequestBody requestBody = new ResendConfirmationEmailRequestBody(oldConfirmationToken);

    when(this.tokenService.isValidToken(eq(oldConfirmationToken))).thenReturn(false);
    when(this.tokenService.generateToken(any(), any())).thenReturn(newConfirmationToken);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/resend_confirmation_email")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    verify(this.mailService, times(1)).sendConfirmationEmail(anyString(), anyString(), any());

    User dbUser = this.userRepo.findByEmail(user.getEmail()).get();
    assertThat(dbUser.getConfirmationToken()).isEqualTo(newConfirmationToken);
  }

  @Test
  @DisplayName("should not be able to resend a confirmation email with an invalid token")
  public void shouldNotBeAbleToResendConfirmationEmailWithInvalidToken() throws Exception {
    String confirmationToken = "some-confirmation-token";

    ResendConfirmationEmailRequestBody requestBody = new ResendConfirmationEmailRequestBody(confirmationToken);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/resend_confirmation_email")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to resend a confirmation email with a still valid token")
  public void shouldNotBeAbleToResendConfirmationEmailWithAStillValidToken() throws Exception {
    String confirmationToken = "some-confirmation-token";

    User user = ModelFactory.getTestUser();
    user.setConfirmationToken(confirmationToken);
    this.userRepo.save(user);

    ResendConfirmationEmailRequestBody requestBody = new ResendConfirmationEmailRequestBody(confirmationToken);

    when(this.tokenService.isValidToken(eq(confirmationToken))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/resend_confirmation_email")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
