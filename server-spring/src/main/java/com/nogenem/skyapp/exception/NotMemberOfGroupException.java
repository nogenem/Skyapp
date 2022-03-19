package com.nogenem.skyapp.exception;

public class NotMemberOfGroupException extends TranslatableApiException {

  public NotMemberOfGroupException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.not_member_of_group");
  }

}
