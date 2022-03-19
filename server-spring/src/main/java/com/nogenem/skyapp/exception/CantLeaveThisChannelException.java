package com.nogenem.skyapp.exception;

public class CantLeaveThisChannelException extends TranslatableApiException {

  public CantLeaveThisChannelException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.cant_leave_this_channel");
  }

}
