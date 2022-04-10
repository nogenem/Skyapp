package com.nogenem.skyapp.integration.AuthController;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.ResetPasswordRequestBody;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

public class ResetPasswordTest extends BaseIntegrationTest {

  @MockBean
  private TokenService tokenService;

  @MockBean
  private BCryptPasswordEncoder bCryptPasswordEncoder;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to change password")
  public void shouldBeAbleToChangePassword() throws Exception {
    String newPassword = "new-password";
    String resetPasswordToken = "some-reset-password-token";

    User user = ModelFactory.getTestUser();
    user.setResetPasswordToken(resetPasswordToken);
    this.userRepo.save(user);

    ResetPasswordRequestBody requestBody = new ResetPasswordRequestBody(newPassword, newPassword, resetPasswordToken);

    when(this.tokenService.isValidToken(eq(resetPasswordToken))).thenReturn(true);
    when(this.bCryptPasswordEncoder.encode(eq(newPassword))).thenReturn(newPassword);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/reset_password")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.user").exists());

    User dbUser = this.userRepo.findByEmail(user.getEmail()).get();
    assertThat(dbUser.getResetPasswordToken()).isEqualTo("");
    assertThat(dbUser.getPasswordHash()).isEqualTo(newPassword);
  }

  @Test
  @DisplayName("should not be able to change password with an invalid token")
  public void shouldNotBeAbleToChangePasswordWithInvalidToken() throws Exception {
    String newPassword = "new-password";
    String resetPasswordToken1 = "some-reset-password-token";
    String resetPasswordToken2 = "another-reset-password-token";

    User user = ModelFactory.getTestUser();
    user.setResetPasswordToken(resetPasswordToken1);
    this.userRepo.save(user);

    ResetPasswordRequestBody requestBody = new ResetPasswordRequestBody(newPassword, newPassword, resetPasswordToken2);

    when(this.tokenService.isValidToken(eq(resetPasswordToken1))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/reset_password")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to change password with the same token twice")
  public void shouldNotBeAbleToChangePasswordWithTheSameTokenTwice() throws Exception {
    String newPassword1 = "new-password-1";
    String newPassword2 = "new-password-2";
    String resetPasswordToken = "some-reset-password-token";

    User user = ModelFactory.getTestUser();
    user.setResetPasswordToken(resetPasswordToken);
    this.userRepo.save(user);

    ResetPasswordRequestBody requestBody = new ResetPasswordRequestBody(newPassword1, newPassword1, resetPasswordToken);

    when(this.tokenService.isValidToken(eq(resetPasswordToken))).thenReturn(true);
    when(this.bCryptPasswordEncoder.encode(eq(newPassword1))).thenReturn(newPassword1);
    when(this.bCryptPasswordEncoder.encode(eq(newPassword2))).thenReturn(newPassword2);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/reset_password")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk());

    requestBody = new ResetPasswordRequestBody(newPassword2, newPassword2, resetPasswordToken);

    resultActions = this.mvc.perform(post("/api/auth/reset_password")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest());

    User dbUser = this.userRepo.findByEmail(user.getEmail()).get();
    assertThat(dbUser.getPasswordHash()).isEqualTo(newPassword1);
  }

}
