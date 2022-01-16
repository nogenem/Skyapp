package com.nogenem.skyapp.requestBody.auth;

import javax.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateTokenRequestBody {

  @NotBlank(message = "errors.invalid_or_expired_token")
  private String token;

}
