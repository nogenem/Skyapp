package com.nogenem.skyapp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.User;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.AutoConfigureDataMongo;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
@AutoConfigureDataMongo
@SpringBootTest
public class BaseIntegrationTest {

  @Autowired
  private MongoTemplate mongoTemplate;

  @Autowired
  protected MockMvc mvc;

  @Autowired
  protected ObjectMapper objectMapper;

  @AfterEach
  public void cleanUpDatabase() {
    // I cant drop the db cause then the indexes aren't recreated after...
    mongoTemplate.getDb().listCollectionNames().forEach(name -> {
      mongoTemplate.remove(new Query(), name);
    });
  }

  protected void logInTestUser(User user) {
    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
      user, null, Collections.emptyList());
    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
  }

  protected User getTestUser() {
    String id = this.getNewObjectIdString();
    return new User(
      id, "Test " + id, id + "@test.com", "test123", false, "", "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
  }

  protected Channel getTestChannel(List<User> users) {
    return this.getTestChannel(users, users.size());
  }

  protected Channel getTestChannel(List<User> users, int membersLen) {
    ArrayList<Member> members = new ArrayList<>();

    for(int i = 0; i < membersLen; i++) {
      String userId = i < users.size() ? users.get(i).getId() : this.getNewObjectIdString();
      members.add(new Member(this.getNewObjectIdString(), userId, i == 0, Instant.now()));
    }

    Boolean isGroupChannel = membersLen > 2;
    String channelName = isGroupChannel ? "some group" : "private channel";

    return new Channel(
      this.getNewObjectIdString(), channelName, isGroupChannel, members, Instant.now(), Instant.now(), null);
  }

  protected String getNewObjectIdString() {
    return (new ObjectId()).toString();
  }

}
