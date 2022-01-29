package com.nogenem.skyapp.DTO;

import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.model.User;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO implements ISocketEventData {

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

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("_id", this.get_id());
    obj.put("nickname", this.getNickname());
    obj.put("email", this.getEmail());
    obj.put("confirmed", this.getConfirmed());
    obj.put("status", this.getStatus().getValue());
    obj.put("thoughts", this.getThoughts());
    obj.put("token", this.getToken());

    return obj;
  }

}
