package com.nogenem.skyapp.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.stream.Stream;

import com.nogenem.skyapp.model.Message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

  @Query(value = "{ 'channelId': ?0, updatedAt: { $gt: ?1 } }", count = true)
  Integer countUnreadMessages(String channelId, Instant memberLastSeen);

  Page<Message> findPageByChannelId(String channelId, Pageable paging);

  @Query("{" +
      "  $and: [" +
      "    { '_id': ?0 }," +
      "    { 'channelId': ?1 }," +
      "    { 'fromId': ?2 }," +
      "    { 'type': ?3 }," +
      "  ]" +
      "}")
  public Optional<Message> findMessageToEdit(String id, String channelId, String fromId, int type);

  @Query("{" +
      "  $and: [" +
      "    { '_id': ?0 }," +
      "    { 'channelId': ?1 }," +
      "    { 'fromId': ?2 }," +
      "  ]" +
      "}")
  public Optional<Message> findMessageToDelete(String id, String channelId, String fromId);

  @Query(value = "{ 'channelId': ?0 }", sort = "{ 'createdAt': -1 }")
  public Stream<Message> findStreamOfLatestMessages(String channelId);
}
