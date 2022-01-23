package com.nogenem.skyapp.model;

import java.time.Instant;

import com.mongodb.lang.NonNull;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.Data;

@Data
public class Member {

  @NonNull
  @Indexed(unique = true, name = "members.userId_1")
  @Field(targetType = FieldType.OBJECT_ID)
  private String userId;

  private Boolean isAdm = false;

  private Instant lastSeen;

}
