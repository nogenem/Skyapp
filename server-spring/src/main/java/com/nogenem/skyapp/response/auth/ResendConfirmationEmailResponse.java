package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResendConfirmationEmailResponse extends ApiResponse {

  public ResendConfirmationEmailResponse() {
    super("messages.confirmation_email_was_resend");
  }

}
