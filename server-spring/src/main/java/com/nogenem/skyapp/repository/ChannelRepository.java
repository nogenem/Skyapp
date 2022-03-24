package com.nogenem.skyapp.repository;

import java.util.Optional;

import com.nogenem.skyapp.model.Channel;

import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelRepository extends MongoRepository<Channel, String> {

  @Aggregation(pipeline = {
      "{" +
          "    '$match': {" +
          "        'members.userId': ?0" +
          "    }" +
          "}",

      "{" +
          "    '$lookup': {" +
          "        'from': 'messages'," +
          "        'let': {" +
          "            'channelsId': '$_id'" +
          "        }," +
          "        'pipeline': [" +
          "            {" +
          "                '$match': {" +
          "                    '$expr': {" +
          "                        '$eq': [" +
          "                            '$channelId'," +
          "                            '$$channelsId'" +
          "                        ]" +
          "                    }" +
          "                }" +
          "            }," +
          "            {" +
          "                '$sort': {" +
          "                    'createdAt': -1" +
          "                }" +
          "            }," +
          "            {" +
          "                '$limit': 1" +
          "            }," +
          "            {" +
          "                '$project': {" +
          "                    'channelId': 1," +
          "                    'fromId': 1," +
          "                    'body': 1," +
          "                    'type': 1," +
          "                    'createdAt': 1," +
          "                    'updatedAt': 1" +
          "                }" +
          "            }" +
          "        ]," +
          "        'as': 'messages'" +
          "    }" +
          "}",

      "{" +
          "    '$project': {" +
          "        'name': 1," +
          "        'isGroup': 1," +
          "        'members': 1," +
          "        'lastMessage': {" +
          "            '$arrayElemAt': [" +
          "                '$messages'," +
          "                0" +
          "            ]" +
          "        }" +
          "    }" +
          "}"
  })
  AggregationResults<Channel> findUserChannelsWithLastMessage(String userId);

  @Query("{" +
      "  $and: [" +
      "    { 'isGroup': false }," +
      "    { 'members.userId': ?0 }," +
      "    { 'members.userId': ?1 }," +
      "  ]" +
      "}")
  Optional<Channel> findPrivateChannel(String userId1, String userId2);

  @Query("{" +
      "  $and: [" +
      "    { '_id': ?0 }," +
      "    { 'members.userId': ?1 }," +
      "  ]" +
      "}")
  Optional<Channel> findByIdAndMemberId(String channelId, String memberId);
}
