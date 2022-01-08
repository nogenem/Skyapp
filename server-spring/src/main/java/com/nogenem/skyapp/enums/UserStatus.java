package com.nogenem.skyapp.enums;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonValue;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter(onMethod = @__({ @JsonValue }))
public enum UserStatus {
  ACTIVE(1),
  AWAY(2),
  DO_NOT_DISTURB(3),
  INVISIBLE(4);

  private int value;

  private static Map<Integer, UserStatus> reverseLookup = Arrays.stream(UserStatus.values())
      .collect(Collectors.toMap(UserStatus::getValue, Function.identity()));

  public static UserStatus fromInt(final int id) {
    return reverseLookup.getOrDefault(id, ACTIVE);
  }
}
