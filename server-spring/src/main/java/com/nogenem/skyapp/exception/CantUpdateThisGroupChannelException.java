package com.nogenem.skyapp.exception;

public class CantUpdateThisGroupChannelException extends TranslatableApiException {

  public CantUpdateThisGroupChannelException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.can_update_this_group_channel");
  }

}
