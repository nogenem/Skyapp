package com.nogenem.skyapp.service;

import java.util.List;

import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.repository.ChannelRepository;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ChannelService {

  private ChannelRepository channelRepository;

  public List<Channel> findAll() {
    return this.channelRepository.findAll();
  }

  public Channel save(Channel channel) {
    return this.channelRepository.save(channel);
  }

  public Boolean privateChannelExists(String userId1, String userId2) {
    Channel channel = this.channelRepository.getPrivateChannel(userId1, userId2);
    return channel != null;
  }

}
