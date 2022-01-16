package com.nogenem.skyapp.exception;

public class InvalidCredentialsException extends TranslatableApiException {

  public InvalidCredentialsException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.invalid_credentials");
  }

}
