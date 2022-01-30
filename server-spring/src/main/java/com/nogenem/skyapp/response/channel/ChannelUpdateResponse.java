package com.nogenem.skyapp.response.channel;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChannelUpdateResponse extends ApiResponse {

  private String channelId;

  public ChannelUpdateResponse(String channelId) {
    super("messages.channel_updated");

    this.channelId = channelId;
  }

}
