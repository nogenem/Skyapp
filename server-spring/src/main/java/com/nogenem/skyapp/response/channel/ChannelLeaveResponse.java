package com.nogenem.skyapp.response.channel;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChannelLeaveResponse extends ApiResponse {

  public ChannelLeaveResponse() {
    super("messages.removed_from_group_channel");
  }

}
