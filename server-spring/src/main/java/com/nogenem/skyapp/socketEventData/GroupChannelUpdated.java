package com.nogenem.skyapp.socketEventData;

import java.util.HashMap;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupChannelUpdated implements ISocketEventData {
  private ChatChannelDTO channelDTO;
  private HashMap<String, Integer> unreadMessagesHash;
}
