package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SignInResponse extends ApiResponse {

  private UserDTO user;

  public SignInResponse(UserDTO user) {
    super("messages.sign_success");

    this.user = user;
  }

}
