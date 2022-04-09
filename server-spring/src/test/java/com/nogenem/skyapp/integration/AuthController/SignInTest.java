package com.nogenem.skyapp.integration.AuthController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.time.Instant;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.SignInRequestBody;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

public class SignInTest extends BaseIntegrationTest {

  @MockBean
  private BCryptPasswordEncoder bCryptPasswordEncoder;

  @MockBean
  private TokenService tokenService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to sign in")
  public void shouldBeAbleToSignIn() throws Exception {
    User user = new User(
        "123", "Test 1", "test@test.com", "test123", false, "", "", UserStatus.ACTIVE,
        "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    SignInRequestBody requestBody = new SignInRequestBody(user.getEmail(), user.getPasswordHash(), false);

    when(this.bCryptPasswordEncoder.matches(eq(user.getPasswordHash()), eq(user.getPasswordHash()))).thenReturn(true);
    String token = "some-token";
    when(this.tokenService.generateToken(any(), any())).thenReturn(token);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signin")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
      .andExpect(jsonPath("$.user").exists())
      .andExpect(jsonPath("$.user.token").value(token));
  }

  @Test
  @DisplayName("should not be able to sign in with an invalid email")
  public void shouldNotBeAbleToSignWithInvalidEmail() throws Exception {
    SignInRequestBody requestBody = new SignInRequestBody("test@test.com", "test123", false);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signin")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").isNotEmpty());
  }

  @Test
  @DisplayName("should not be able to sign in with an invalid password")
  public void shouldNotBeAbleToSignInWithInvalidPassword() throws Exception {
    String password1 = "test123";
    String password2 = "another-password";

    User user = new User(
        "123", "Test 1", "test@test.com", password1, false, "", "", UserStatus.ACTIVE,
        "", Instant.now(), Instant.now());
    this.userRepo.save(user);

    SignInRequestBody requestBody = new SignInRequestBody(user.getEmail(), password2, false);

    when(this.bCryptPasswordEncoder.matches(eq(user.getPasswordHash()), eq(user.getPasswordHash()))).thenReturn(true);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/signin")
      .contentType(MediaType.APPLICATION_JSON)
      .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors").exists());
  }

}
