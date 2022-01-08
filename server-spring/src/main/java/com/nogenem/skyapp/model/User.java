package com.nogenem.skyapp.model;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.mongodb.lang.NonNull;
import com.nogenem.skyapp.enums.UserStatus;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "users")
@Data
@JsonPropertyOrder(value = { "_id" })
public class User {

  @Id
  @JsonProperty("_id")
  private String id;

  @NonNull
  private String nickname;

  @Indexed(unique = true, name = "email_1")
  private String email;

  @NonNull
  @Getter(onMethod = @__({ @JsonIgnore }))
  @Setter(onMethod = @__({ @JsonSetter }))
  private String passwordHash;

  private Boolean confirmed;

  private String confirmationToken;

  private String resetPasswordToken;

  @Field(targetType = FieldType.INT32)
  private UserStatus status;

  private String thoughts;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

}
