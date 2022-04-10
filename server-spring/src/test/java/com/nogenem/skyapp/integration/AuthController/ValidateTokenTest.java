package com.nogenem.skyapp.integration.AuthController;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nogenem.skyapp.BaseIntegrationTest;
import com.nogenem.skyapp.ModelFactory;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.ValidateTokenRequestBody;
import com.nogenem.skyapp.service.TokenService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

public class ValidateTokenTest extends BaseIntegrationTest {

  @MockBean
  private TokenService tokenService;

  @Autowired
  private UserRepository userRepo;

  @Test
  @DisplayName("should be able to validate a valid token")
  public void shouldBeAbleToValidateAValidToken() throws Exception {
    String userId = "123";
    String token = "some-token";

    User user = ModelFactory.getTestUser();
    user.setId(userId);
    this.userRepo.save(user);

    ValidateTokenRequestBody requestBody = new ValidateTokenRequestBody(token);

    when(this.tokenService.getUserIdFromToken(eq(token))).thenReturn(userId);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/validate_token")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isOk())
        .andExpect(jsonPath("$.user").exists())
        .andExpect(jsonPath("$.user.token").value(token));
  }

  @Test
  @DisplayName("should not be able to validate an invalid token")
  public void shouldNotBeAbleToValidateAnInvalidToken() throws Exception {
    String token1 = "some-token";
    String token2 = "another-token";
    String userId = "123";

    User user = ModelFactory.getTestUser();
    user.setId(userId);
    this.userRepo.save(user);

    ValidateTokenRequestBody requestBody = new ValidateTokenRequestBody(token2);

    when(this.tokenService.getUserIdFromToken(eq(token1))).thenReturn(userId);

    ResultActions resultActions = this.mvc.perform(post("/api/auth/validate_token")
        .contentType(MediaType.APPLICATION_JSON)
        .content(this.objectMapper.writeValueAsString(requestBody)));

    resultActions.andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isNotEmpty());
  }

}
