package com.nogenem.skyapp.socketEventData;

import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSignedOut implements ISocketEventData {
  private String userId;
}
