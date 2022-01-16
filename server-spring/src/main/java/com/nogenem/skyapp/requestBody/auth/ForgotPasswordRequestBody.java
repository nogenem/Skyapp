package com.nogenem.skyapp.requestBody.auth;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordRequestBody {

  @NotBlank(message = "errors.cant_be_blank")
  @Email(message = "errors.invalid_email")
  private String email;

}
