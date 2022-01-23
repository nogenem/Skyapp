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
public enum MessageType {
  TEXT(1),
  UPLOADED_FILE(2);

  private int value;

  private static Map<Integer, MessageType> reverseLookup = Arrays.stream(MessageType.values())
      .collect(Collectors.toMap(MessageType::getValue, Function.identity()));

  public static MessageType fromInt(final int id) {
    return reverseLookup.getOrDefault(id, TEXT);
  }
}
