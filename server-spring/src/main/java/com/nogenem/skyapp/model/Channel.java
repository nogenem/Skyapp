package com.nogenem.skyapp.model;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.mongodb.lang.NonNull;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Document(collection = "channels")
@Data
@JsonPropertyOrder(value = { "_id" })
public class Channel {

  @Id
  @JsonProperty("_id")
  private String id;

  @NonNull
  private String name;

  @NonNull
  private Boolean isGroup;

  private List<Member> members;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  // @Transient // was causing problems while loading the doc from the database...
  @ReadOnlyProperty
  private Message lastMessage;

}
