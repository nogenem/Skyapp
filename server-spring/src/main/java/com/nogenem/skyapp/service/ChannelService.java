package com.nogenem.skyapp.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.repository.ChannelRepository;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ChannelService {

  private ChannelRepository channelRepository;
  private MongoTemplate template;

  public List<Channel> findAll() {
    return this.channelRepository.findAll();
  }

  public Channel findById(String channelId) {
    Optional<Channel> channel = this.channelRepository.findById(channelId);
    if (channel.isPresent()) {
      return channel.get();
    } else {
      return null;
    }
  }

  public Channel getChannelByIdAndUserId(String channelId, String userId) {
    return this.channelRepository.getChannelByIdAndUserId(channelId, userId);
  }

  public Channel save(Channel channel) {
    return this.channelRepository.save(channel);
  }

  public Boolean privateChannelExists(String userId1, String userId2) {
    Channel channel = this.channelRepository.getPrivateChannel(userId1, userId2);
    return channel != null;
  }

  public void delete(Channel channel) {
    this.channelRepository.delete(channel);
  }

  public Channel updateMemberLastSeen(String channelId, String memberId, Instant lastSeen) {
    Query query = new Query();
    query.addCriteria(Criteria.where("_id").is(channelId));
    query.addCriteria(Criteria.where("members.userId").is(memberId));

    Update update = new Update();
    update.set("members.$.lastSeen", lastSeen);

    return this.template.findAndModify(query, update, new FindAndModifyOptions().returnNew(true), Channel.class);
  }

}
