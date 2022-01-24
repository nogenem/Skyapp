package com.nogenem.skyapp.response;

import java.util.HashMap;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatUserDTO;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatInitialData {
  HashMap<String, ChatChannelDTO> channels;
  HashMap<String, ChatUserDTO> users;

  public ChatInitialData() {
    this.channels = new HashMap<>();
    this.users = new HashMap<>();
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    JSONObject channels = new JSONObject();
    for (String key : this.channels.keySet()) {
      channels.put(key, this.channels.get(key).toJSON());
    }
    obj.put("channels", channels);

    JSONObject users = new JSONObject();
    for (String key : this.users.keySet()) {
      users.put(key, this.users.get(key).toJSON());
    }
    obj.put("users", users);

    return obj;
  }
}
