package com.nogenem.skyapp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;

import org.bson.types.ObjectId;

final public class ModelFactory {

  public static User getTestUser() {
    String id = ModelFactory.getNewObjectIdString();
    return new User(
      id, "Test " + id, id + "@test.com", "test123", false, "", "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
  }

  public static Channel getTestChannel(List<User> users) {
    return ModelFactory.getTestChannel(users, users.size());
  }

  public static Channel getTestChannel(List<User> users, int membersLen) {
    ArrayList<Member> members = new ArrayList<>();

    for(int i = 0; i < membersLen; i++) {
      String userId = i < users.size() ? users.get(i).getId() : ModelFactory.getNewObjectIdString();
      members.add(new Member(ModelFactory.getNewObjectIdString(), userId, i == 0, Instant.now()));
    }

    Boolean isGroupChannel = membersLen > 2;
    String channelName = isGroupChannel ? "some group" : "private channel";

    return new Channel(
      ModelFactory.getNewObjectIdString(), channelName, isGroupChannel, members, Instant.now(), Instant.now(), null);
  }

  private static String getNewObjectIdString() {
    return (new ObjectId()).toString();
  }

  public static Message getTestMessage() {
    String id = ModelFactory.getNewObjectIdString();
    String channelId = ModelFactory.getNewObjectIdString();
    String fromId = ModelFactory.getNewObjectIdString();
    Object body = "Some message";
    MessageType type = MessageType.TEXT;
    return new Message(id, channelId, fromId, body, type, Instant.now(), Instant.now());
  }

}
