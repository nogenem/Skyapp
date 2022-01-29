package com.nogenem.skyapp.exception;

public class GroupHasTooFewMembersException extends TranslatableApiException {

  public GroupHasTooFewMembersException(int minMembers) {
    super();

    // PS: It has to be in the index 2 cause of the @Size annotation ;/
    Object[] args = { "", "", minMembers };
    this.put(TranslatableApiException.GLOBAL_KEY, "errors.group_has_too_few_members", args);
  }

}
