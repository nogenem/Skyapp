package com.nogenem.skyapp.DTO;

import java.time.Instant;

import com.nogenem.skyapp.model.Member;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatMemberDTO {

  private String userId;
  private Boolean isAdm;
  private Instant lastSeen;

  public ChatMemberDTO(Member member) {
    this.userId = member.getUserId();
    this.isAdm = member.getIsAdm();
    this.lastSeen = member.getLastSeen();
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("userId", this.getUserId());
    obj.put("isAdm", this.getIsAdm());
    obj.put("lastSeen", this.getLastSeen().toString());

    return obj;
  }

}
