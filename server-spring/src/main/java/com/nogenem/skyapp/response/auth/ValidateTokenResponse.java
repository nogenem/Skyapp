package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ValidateTokenResponse extends ApiResponse {

  private UserDTO user;

  public ValidateTokenResponse(UserDTO user) {
    super("messages.token_is_valid");

    this.user = user;
  }

}
