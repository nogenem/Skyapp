package com.nogenem.skyapp;

import java.time.Instant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;

import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.AutoConfigureDataMongo;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
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
  void cleanUpDatabase() {
    // I cant drop the db cause then the indexes aren't recreated after...
    mongoTemplate.getDb().listCollectionNames().forEach(name -> {
      mongoTemplate.remove(new Query(), name);
    });
  }

  protected User getTestUser() {
    return new User(
      "123", "Test 1", "test@test.com", "test123", false, "", "", UserStatus.ACTIVE,
      "", Instant.now(), Instant.now());
  }

}
