package com.nogenem.skyapp.exception;

public class ChannelAlreadyExistsException extends TranslatableApiException {

  public ChannelAlreadyExistsException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.channel_already_exists");
  }

}
