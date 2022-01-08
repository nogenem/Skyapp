package com.nogenem.skyapp.requestBody.auth;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import com.nogenem.skyapp.annotation.PasswordMatch;
import com.nogenem.skyapp.interfaces.IHasPasswordAndConfirmation;

import org.hibernate.validator.constraints.Length;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@PasswordMatch
public class SignUpRequestBody implements IHasPasswordAndConfirmation {

  // TODO: Add i18n
  @NotBlank(message = "This field can't be blank")
  @Length(min = 4, message = "This field must have at least 4 characters")
  private String nickname;

  @NotBlank(message = "This field can't be blank")
  @Email(message = "Invalid email")
  private String email;

  @NotBlank(message = "This field can't be blank")
  @Length(min = 6, message = "This field must have at least 6 characters")
  private String password;

  @NotBlank(message = "This field can't be blank")
  @Length(min = 6, message = "This field must have at least 6 characters")
  private String passwordConfirmation;

}
