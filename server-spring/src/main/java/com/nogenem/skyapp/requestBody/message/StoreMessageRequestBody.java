package com.nogenem.skyapp.requestBody.message;

import javax.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StoreMessageRequestBody {

  @NotBlank(message = "errors.cant_be_blank")
  private String body;

}
