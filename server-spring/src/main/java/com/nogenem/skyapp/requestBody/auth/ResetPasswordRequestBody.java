package com.nogenem.skyapp.requestBody.auth;

import javax.validation.constraints.NotBlank;

import com.nogenem.skyapp.annotation.PasswordMatch;
import com.nogenem.skyapp.interfaces.IHasPasswordAndConfirmation;

import org.hibernate.validator.constraints.Length;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@PasswordMatch
public class ResetPasswordRequestBody implements IHasPasswordAndConfirmation {

  @NotBlank(message = "errors.cant_be_blank")
  @Length(min = 6, message = "errors.field_is_too_short")
  private String newPassword;

  @NotBlank(message = "errors.cant_be_blank")
  @Length(min = 6, message = "errors.field_is_too_short")
  private String newPasswordConfirmation;

  @NotBlank(message = "errors.cant_be_blank")
  private String token;

  public String getPassword() {
    return this.newPassword;
  }

  public String getPasswordConfirmation() {
    return this.newPasswordConfirmation;
  }
}
