package com.nogenem.skyapp.exception;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(value = { "cause", "stackTrace", "message", "suppressed", "localizedMessage" })
public class ApiException extends RuntimeException {

  public static final String GLOBAL_KEY = "global";

  private HashMap<String, List<String>> errors;

  public ApiException() {
    this.errors = new HashMap<>();
  }

  public void put(String key, String message) {
    if (!this.errors.containsKey(key)) {
      this.errors.put(key, new ArrayList<>());
    }

    this.errors.get(key).add(message);
  }
}
