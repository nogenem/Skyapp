package com.nogenem.skyapp.DTO;

import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatUserDTO {

  private String _id;
  private String nickname;
  private String thoughts;
  private UserStatus status;
  private Boolean online;
  private String channelId;

  public ChatUserDTO(User user, Boolean online, String channelId) {
    this._id = user.getId();
    this.nickname = user.getNickname();
    this.status = user.getStatus();
    this.thoughts = user.getThoughts();
    this.online = online;
    this.channelId = channelId;
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("_id", this.get_id());
    obj.put("nickname", this.getNickname());
    obj.put("status", this.getStatus().getValue());
    obj.put("thoughts", this.getThoughts());
    obj.put("online", this.getOnline());
    obj.put("channelId", this.getChannelId());

    return obj;
  }

}
