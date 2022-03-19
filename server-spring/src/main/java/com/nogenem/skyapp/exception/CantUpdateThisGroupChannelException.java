package com.nogenem.skyapp.exception;

public class CantUpdateThisGroupChannelException extends TranslatableApiException {

  public CantUpdateThisGroupChannelException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.cant_update_this_group_channel");
  }

}
