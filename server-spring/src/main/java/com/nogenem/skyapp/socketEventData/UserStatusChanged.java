package com.nogenem.skyapp.socketEventData;

import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.interfaces.ISocketEventData;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatusChanged implements ISocketEventData {
  private String userId;
  private UserStatus newStatus;
}
