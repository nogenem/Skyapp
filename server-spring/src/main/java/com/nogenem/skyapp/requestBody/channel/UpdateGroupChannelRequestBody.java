package com.nogenem.skyapp.requestBody.channel;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import com.nogenem.skyapp.constants.ValidationLimits;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateGroupChannelRequestBody {

  @NotBlank(message = "errors.cant_be_blank")
  private String name;

  @Size(min = ValidationLimits.MIN_GROUP_CHANNEL_MEMBERS, message = "errors.group_has_too_few_members")
  private String[] members;

  private String[] admins;

}
