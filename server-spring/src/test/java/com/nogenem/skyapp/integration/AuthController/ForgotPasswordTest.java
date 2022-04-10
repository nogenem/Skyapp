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
import com.nogenem.skyapp.requestBody.auth.ForgotPasswordRequestBody;
import com.nogenem.skyapp.service.MailService;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class ForgotPasswordTest extends BaseIntegrationTest {

  @MockBean
  private MailService mailService;

  @MockBean
  private TokenService tokenService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able send a reset password email")
  public void shouldBeAbleToSendAResetPasswordEmail() throws Exception {
    String resetPasswordToken = "some-token";

    User user = ModelFactory.getTestUser();
    this.userRepo.save(user);

    ForgotPasswordRequestBody requestBody = new ForgotPasswordRequestBody(user.getEmail());

    when(this.tokenService.generateToken(any(), any())).thenReturn(resetPasswordToken);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/forgot_password")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    verify(this.mailService, times(1)).sendResetPasswordEmail(anyString(), anyString(), any());

    User dbUser = this.userRepo.findByEmail(user.getEmail()).get();
    assertThat(dbUser.getResetPasswordToken()).isEqualTo(resetPasswordToken);
  }

  @Test
  @DisplayName("should not be able send a reset password email to an invalid email")
  public void shouldNotBeAbleToSendAResetPasswordEmailToInvalidEmail() throws Exception {
    String email = "some@email.com";

    ForgotPasswordRequestBody requestBody = new ForgotPasswordRequestBody(email);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/forgot_password")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able send a reset password email with a still valid token")
  public void shouldNotBeAbleToSendAResetPasswordEmailWithAStilValidToken() throws Exception {
    String resetPasswordToken = "some-token";

    User user = ModelFactory.getTestUser();
    user.setResetPasswordToken(resetPasswordToken);
    this.userRepo.save(user);

    ForgotPasswordRequestBody requestBody = new ForgotPasswordRequestBody(user.getEmail());

    when(this.tokenService.isValidToken(eq(resetPasswordToken))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/forgot_password")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
