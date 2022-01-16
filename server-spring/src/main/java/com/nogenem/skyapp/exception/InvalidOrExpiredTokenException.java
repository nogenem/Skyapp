package com.nogenem.skyapp.exception;

public class InvalidOrExpiredTokenException extends TranslatableApiException {

  public InvalidOrExpiredTokenException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.invalid_or_expired_token");
  }

}
