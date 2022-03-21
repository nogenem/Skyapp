package com.nogenem.skyapp.response.message;

import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MessageDeleteResponse extends ApiResponse {

  private ChatMessageDTO messageObj;
  private ChatMessageDTO lastMessage;

  public MessageDeleteResponse(ChatMessageDTO messageObj, ChatMessageDTO lastMessage) {
    super("messages.message_deleted");

    this.messageObj = messageObj;
    this.lastMessage = lastMessage;
  }

}
