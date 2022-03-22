package com.nogenem.skyapp.socketEventData;

import java.time.Instant;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberLastSeenChanged implements ISocketEventData {
  private ChatChannelDTO channelDTO;
  private String userId;
  private Instant lastSeen;
}
