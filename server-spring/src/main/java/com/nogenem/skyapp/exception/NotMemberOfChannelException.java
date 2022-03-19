package com.nogenem.skyapp.exception;

public class NotMemberOfChannelException extends TranslatableApiException {

  public NotMemberOfChannelException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.not_member_of_channel");
  }

}
