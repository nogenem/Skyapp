package com.nogenem.skyapp.DTO;

import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {

  private String _id;
  private String nickname;
  private String email;
  private Boolean confirmed;
  private UserStatus status;
  private String thoughts;
  private String token;

  public UserDTO(User user, String token) {
    this._id = user.getId();
    this.nickname = user.getNickname();
    this.email = user.getEmail();
    this.confirmed = user.getConfirmed();
    this.status = user.getStatus();
    this.thoughts = user.getThoughts();
    this.token = token;
  }

}
