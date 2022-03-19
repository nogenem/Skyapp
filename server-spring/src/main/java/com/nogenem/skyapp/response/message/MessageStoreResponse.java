package com.nogenem.skyapp.response.message;

import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MessageStoreResponse extends ApiResponse {

  private ChatMessageDTO messageObj;

  public MessageStoreResponse(ChatMessageDTO messageObj) {
    super("messages.message_sent");

    this.messageObj = messageObj;
  }

}
