package com.nogenem.skyapp.repository;

import java.time.Instant;

import com.nogenem.skyapp.model.Message;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

  @Query(value = "{ 'channelId': ?0, updatedAt: { $gt: ?1 } }", count = true)
  Integer countUnreadMessages(String channelId, Instant memberLastSeen);

}
