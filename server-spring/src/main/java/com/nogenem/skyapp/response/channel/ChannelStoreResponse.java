package com.nogenem.skyapp.response.channel;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ChannelStoreResponse extends ApiResponse {

  private String channelId;

  public ChannelStoreResponse(String channelId) {
    super("messages.channel_created");

    this.channelId = channelId;
  }

}
