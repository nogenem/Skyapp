package com.nogenem.skyapp.exception;

public class InvalidIdException extends TranslatableApiException {

  public InvalidIdException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.invalid_id");
  }

}
