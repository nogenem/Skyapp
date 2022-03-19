package com.nogenem.skyapp.exception;

public class CantEditThisMessageException extends TranslatableApiException {

  public CantEditThisMessageException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.cant_edit_this_message");
  }

}
