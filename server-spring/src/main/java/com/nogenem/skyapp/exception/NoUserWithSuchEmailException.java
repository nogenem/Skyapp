package com.nogenem.skyapp.exception;

public class NoUserWithSuchEmailException extends TranslatableApiException {

  public NoUserWithSuchEmailException() {
    super();

    this.put("email", "errors.no_user_with_such_email");
  }

}
