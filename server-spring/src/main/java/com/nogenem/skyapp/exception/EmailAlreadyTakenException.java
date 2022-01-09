package com.nogenem.skyapp.exception;

public class EmailAlreadyTakenException extends TranslatableApiException {

  public EmailAlreadyTakenException() {
    super();

    this.put("email", "errors.email_already_taken");
  }

}
