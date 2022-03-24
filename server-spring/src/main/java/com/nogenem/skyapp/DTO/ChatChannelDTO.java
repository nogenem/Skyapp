package com.nogenem.skyapp.DTO;

import java.util.ArrayList;
import java.util.List;

import com.nogenem.skyapp.interfaces.ISocketEventData;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;

import org.json.JSONArray;
import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatChannelDTO implements ISocketEventData {

  private String _id;
  private String name;
  private Boolean isGroup;
  private List<ChatMemberDTO> members;
  private Integer otherMemberIdx;
  private Integer unreadMsgs;
  private ChatMessageDTO lastMessage;

  public ChatChannelDTO(Channel channel) {
    this(channel, null, 0);
  }

  public ChatChannelDTO(Channel channel, Integer otherMemberIdx, Integer unreadMsgs) {
    this._id = channel.getId();
    this.name = channel.getName();
    this.isGroup = channel.getIsGroup();

    this.members = new ArrayList<>();
    for (Member member : channel.getMembers()) {
      this.members.add(new ChatMemberDTO(member));
    }

    this.otherMemberIdx = otherMemberIdx;
    this.unreadMsgs = unreadMsgs;
    if (channel.getLastMessage() != null) {
      this.lastMessage = new ChatMessageDTO(channel.getLastMessage());
    } else {
      this.lastMessage = null;
    }
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("_id", this.get_id());
    obj.put("name", this.getName());
    obj.put("isGroup", this.getIsGroup());

    JSONArray members = new JSONArray();
    for (ChatMemberDTO member : this.getMembers()) {
      members.put(member.toJSON());
    }
    obj.put("members", members);

    if (this.getOtherMemberIdx() != null) {
      obj.put("otherMemberIdx", this.getOtherMemberIdx());
    } else {
      obj.put("otherMemberIdx", JSONObject.NULL);
    }
    obj.put("unreadMsgs", this.getUnreadMsgs());

    if (this.getLastMessage() != null) {
      obj.put("lastMessage", this.getLastMessage().toJSON());
    } else {
      obj.put("lastMessage", JSONObject.NULL);
    }

    return obj;
  }

}
