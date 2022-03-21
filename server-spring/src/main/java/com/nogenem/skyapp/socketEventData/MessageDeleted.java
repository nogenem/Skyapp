package com.nogenem.skyapp.socketEventData;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageDeleted implements ISocketEventData {
  private ChatChannelDTO channel;
  private ChatMessageDTO message;
  private ChatMessageDTO lastMessage;
}
