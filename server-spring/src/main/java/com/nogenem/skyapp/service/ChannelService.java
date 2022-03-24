package com.nogenem.skyapp.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
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

  private final ChannelRepository channelRepository;
  private final MongoTemplate template;

  public List<Channel> findAll() {
    return this.channelRepository.findAll();
  }

  public Channel findById(String channelId) {
    return this.channelRepository.findById(channelId).orElse(null);
  }

  public Channel findByIdAndMemberId(String channelId, String memberId) {
    return this.channelRepository.findByIdAndMemberId(channelId, memberId).orElse(null);
  }

  public Channel save(Channel channel) {
    return this.channelRepository.save(channel);
  }

  public Boolean privateChannelExists(String userId1, String userId2) {
    return this.channelRepository.findPrivateChannel(userId1, userId2).isPresent();
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

  public Channel createPrivateChannel(String member1Id, String member2Id) {
    Instant now = Instant.now();
    List<Member> members = new ArrayList<>();
    members.add(new Member(member1Id, false, now));
    members.add(new Member(member2Id, false, now));

    Channel channel = new Channel();
    channel.setName("private channel");
    channel.setIsGroup(false);
    channel.setMembers(members);
    channel.setCreatedAt(now);
    channel.setUpdatedAt(now);

    return this.save(channel);
  }

  public Channel createGroupChannel(String name, String[] membersIds, HashMap<String, Boolean> adminsIdsHash,
      String loggedInUserId) {
    Instant now = Instant.now();

    List<Member> members = new ArrayList<>();
    members.add(new Member(loggedInUserId, true, now));
    for (int i = 0; i < membersIds.length; i++) {
      members.add(new Member(membersIds[i], adminsIdsHash.containsKey(membersIds[i]), now));
    }

    Channel channel = new Channel();
    channel.setName(name);
    channel.setIsGroup(true);
    channel.setMembers(members);
    channel.setCreatedAt(now);
    channel.setUpdatedAt(now);

    return this.save(channel);
  }

}
