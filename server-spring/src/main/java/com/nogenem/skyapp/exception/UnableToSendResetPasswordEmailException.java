package com.nogenem.skyapp.exception;

public class UnableToSendResetPasswordEmailException extends TranslatableApiException {

  public UnableToSendResetPasswordEmailException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.unable_to_send_reset_password_email");
  }

}
