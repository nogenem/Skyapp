package com.nogenem.skyapp.socketEventData;

import java.util.List;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessagesReceived implements ISocketEventData {
  private ChatChannelDTO channel;
  private List<ChatMessageDTO> messages;
}
