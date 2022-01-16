package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ResetPasswordResponse extends ApiResponse {

  private UserDTO user;

  public ResetPasswordResponse(UserDTO user) {
    super("messages.password_changed");

    this.user = user;
  }

}
