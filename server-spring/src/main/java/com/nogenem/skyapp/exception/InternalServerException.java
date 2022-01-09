package com.nogenem.skyapp.exception;

public class InternalServerException extends TranslatableApiException {

  public InternalServerException() {
    super();

    this.put(ApiException.GLOBAL_KEY, "errors.internal_server_error");
  }

}
