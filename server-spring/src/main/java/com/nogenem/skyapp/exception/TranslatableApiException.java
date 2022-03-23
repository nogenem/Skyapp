package com.nogenem.skyapp.exception;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(value = { "cause", "stackTrace", "message", "suppressed", "localizedMessage" })
public class TranslatableApiException extends RuntimeException {
  public static final String GLOBAL_KEY = "global";

  private HashMap<String, List<TranslatableEntry>> errors;

  public TranslatableApiException() {
    super();

    this.errors = new HashMap<>();
  }

  public void put(String key, String message) {
    this.put(key, message, null);
  }

  public void put(String key, String message, Object[] args) {
    if (!this.errors.containsKey(key)) {
      this.errors.put(key, new ArrayList<>());
    }

    this.errors.get(key).add(new TranslatableEntry(message, args));
  }

  @Data
  @AllArgsConstructor
  public class TranslatableEntry {
    private String message;
    private Object[] args;
  }
}
