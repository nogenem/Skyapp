package com.nogenem.skyapp.requestBody.user;

import javax.validation.constraints.NotNull;

import com.nogenem.skyapp.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStatusRequestBody {

  @NotNull(message = "errors.cant_be_blank")
  private UserStatus newStatus;

}
