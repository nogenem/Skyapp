package com.nogenem.skyapp.exception;

public class UnableToSendConfirmationEmailException extends TranslatableApiException {

  public UnableToSendConfirmationEmailException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.unable_to_send_confirmation_email");
  }

}
