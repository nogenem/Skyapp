package com.nogenem.skyapp.exception;

public class InternalServerException extends ApiException {

  public InternalServerException() {
    super();

    // TODO: Add i18n
    this.put(ApiException.GLOBAL_KEY, "Internal server error");
  }

}
