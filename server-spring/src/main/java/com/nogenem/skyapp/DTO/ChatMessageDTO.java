package com.nogenem.skyapp.DTO;

import java.time.Instant;

import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.model.Attachment;
import com.nogenem.skyapp.model.Message;

import org.json.JSONObject;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatMessageDTO {

  private String _id;
  private String channelId;
  private String fromId;
  private Object body;
  private MessageType type;
  private Instant createdAt;
  private Instant updatedAt;

  public ChatMessageDTO(Message message) {
    this._id = message.getId();
    this.channelId = message.getChannelId();
    this.fromId = message.getFromId();
    this.body = message.getBody();
    if (this.body instanceof Attachment) {
      this.body = new ChatAttachmentDTO((Attachment) this.body);
    }
    this.type = message.getType();
    this.createdAt = message.getCreatedAt();
    this.updatedAt = message.getUpdatedAt();
  }

  public JSONObject toJSON() {
    JSONObject obj = new JSONObject();

    obj.put("_id", this.get_id());
    obj.put("channelId", this.getChannelId());
    obj.put("fromId", this.getFromId());

    if (this.body instanceof ChatAttachmentDTO) {
      obj.put("body", ((ChatAttachmentDTO) this.getBody()).toJSON());
    } else {
      obj.put("body", this.getBody());
    }

    obj.put("type", this.getType().getValue());
    obj.put("createdAt", this.getCreatedAt().toString());
    obj.put("updatedAt", this.getUpdatedAt().toString());

    return obj;
  }

}
