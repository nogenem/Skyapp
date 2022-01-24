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

}
