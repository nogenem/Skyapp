package com.nogenem.skyapp.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@JsonIgnoreProperties(value = { "args" })
public class ApiResponse {

  private String message;
  private Object[] args;

  public ApiResponse(String message) {
    this(message, null);
  }

}
