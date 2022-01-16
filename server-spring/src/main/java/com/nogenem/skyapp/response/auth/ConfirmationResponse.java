package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ConfirmationResponse extends ApiResponse {

  private UserDTO user;

  public ConfirmationResponse(UserDTO user) {
    super("messages.account_confirmed");

    this.user = user;
  }

}
