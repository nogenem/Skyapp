package com.nogenem.skyapp.response.user;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ThoughtsUpdateResponse extends ApiResponse {

  public ThoughtsUpdateResponse() {
    super("messages.user_thoughts_changed");
  }

}
