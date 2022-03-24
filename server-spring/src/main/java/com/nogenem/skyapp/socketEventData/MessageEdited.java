package com.nogenem.skyapp.socketEventData;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageEdited implements ISocketEventData {
  private ChatChannelDTO channelDTO;
  private ChatMessageDTO messageDTO;
}
