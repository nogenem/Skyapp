package com.nogenem.skyapp.exception;

public class LastEmailSentIsStillValidException extends TranslatableApiException {

  public LastEmailSentIsStillValidException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.last_email_sent_is_still_valid");
  }

}
