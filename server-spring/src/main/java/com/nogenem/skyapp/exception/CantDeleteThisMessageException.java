package com.nogenem.skyapp.exception;

public class CantDeleteThisMessageException extends TranslatableApiException {

  public CantDeleteThisMessageException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.cant_delete_this_message");
  }

}
