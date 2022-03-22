package com.nogenem.skyapp.response.user;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class StatusUpdateResponse extends ApiResponse {

  public StatusUpdateResponse() {
    super("messages.user_status_changed");
  }

}
