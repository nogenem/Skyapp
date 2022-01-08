package com.nogenem.skyapp.exception;

public class EmailAlreadyTakenException extends ApiException {

  public EmailAlreadyTakenException() {
    super();

    // TODO: Add i18n
    this.put("email", "This email is already taken");
  }

}
