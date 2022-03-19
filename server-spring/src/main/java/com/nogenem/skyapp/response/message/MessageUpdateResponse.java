package com.nogenem.skyapp.response.message;

import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class MessageUpdateResponse extends ApiResponse {

  private ChatMessageDTO messageObj;

  public MessageUpdateResponse(ChatMessageDTO messageObj) {
    super("messages.message_edited");

    this.messageObj = messageObj;
  }

}
