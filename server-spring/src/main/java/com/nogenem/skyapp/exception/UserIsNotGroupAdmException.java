package com.nogenem.skyapp.exception;

public class UserIsNotGroupAdmException extends TranslatableApiException {

  public UserIsNotGroupAdmException() {
    super();

    this.put(TranslatableApiException.GLOBAL_KEY, "errors.user_is_not_group_adm");
  }

}
