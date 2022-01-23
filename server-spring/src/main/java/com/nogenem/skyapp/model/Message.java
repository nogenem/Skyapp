package com.nogenem.skyapp.model;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mongodb.lang.NonNull;
import com.nogenem.skyapp.enums.MessageType;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.Data;

// https://stackoverflow.com/questions/48010606/using-objectid-as-string-in-java-manual-reference-with-spring-data-mongodb
// https://stackoverflow.com/questions/64163644/spring-mongodb-manual-reference

@Document(collection = "messages")
@Data
@JsonPropertyOrder(value = { "_id" })
public class Message {

  @Id
  @JsonProperty("_id")
  private String id;

  @NonNull
  @Field(targetType = FieldType.OBJECT_ID)
  private String channelId;

  @NonNull
  @Field(targetType = FieldType.OBJECT_ID)
  private String fromId;

  @NonNull
  private Object body;

  @Field(targetType = FieldType.INT32)
  private MessageType type;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  public void setBody(String body) {
    this.body = body;
  }

  public void setBody(Attachment body) {
    this.body = body;
  }

}
