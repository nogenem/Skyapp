package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ForgotPasswordResponse extends ApiResponse {

  public ForgotPasswordResponse() {
    super("messages.reset_password_email_sent");
  }

}
