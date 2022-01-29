package com.nogenem.skyapp.requestBody.auth;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import com.nogenem.skyapp.constants.ValidationLimits;

import org.hibernate.validator.constraints.Length;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignInRequestBody {

  @NotBlank(message = "errors.cant_be_blank")
  @Email(message = "errors.invalid_email")
  private String email;

  @NotBlank(message = "errors.cant_be_blank")
  @Length(min = ValidationLimits.MIN_PASSWORD_LEN, message = "errors.field_is_too_short")
  private String password;

  private boolean rememberMe;

}
