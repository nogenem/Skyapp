package com.nogenem.skyapp.requestBody.channel;

import javax.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StorePrivateChannelRequestBody {

  @NotBlank(message = "errors.cant_be_blank")
  private String otherUserId;

}
