package com.nogenem.skyapp.model;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.mongodb.lang.NonNull;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Member {

  @Id
  @JsonProperty("_id")
  private String id;

  @NonNull
  @Indexed(name = "userId_1")
  @Field(targetType = FieldType.OBJECT_ID)
  private String userId;

  private Boolean isAdm = false;

  private Instant lastSeen;

  public Member() {
    this.id = new ObjectId().toString();
  }

  public Member(String userId, Boolean isAdm, Instant lastSeen) {
    this.id = new ObjectId().toString();
    this.userId = userId;
    this.isAdm = isAdm;
    this.lastSeen = lastSeen;
  }

}
