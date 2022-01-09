package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SignUpResponse extends ApiResponse {

  private UserDTO user;

  public SignUpResponse(UserDTO user) {
    super("messages.user_created");

    this.user = user;
  }

}
