package com.nogenem.skyapp.response.auth;

import com.nogenem.skyapp.DTO.UserDTO;

import lombok.Data;

@Data
public class SignUpResponse {

  // TODO: Add i18n
  private String message = "User created with success";
  private UserDTO user;

  public SignUpResponse(UserDTO user) {
    this.user = user;
  }

}
