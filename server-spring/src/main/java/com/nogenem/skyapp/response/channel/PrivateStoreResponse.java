package com.nogenem.skyapp.response.channel;

import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PrivateStoreResponse extends ApiResponse {

  private String channelId;

  public PrivateStoreResponse(String channelId) {
    super("messages.channel_created");

    this.channelId = channelId;
  }

}
