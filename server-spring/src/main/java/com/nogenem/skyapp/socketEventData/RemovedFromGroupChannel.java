package com.nogenem.skyapp.socketEventData;

import java.util.List;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RemovedFromGroupChannel implements ISocketEventData {
  private ChatChannelDTO channelDTO;
  private List<String> membersIds;
}
